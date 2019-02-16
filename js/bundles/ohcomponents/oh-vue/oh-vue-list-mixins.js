import Yaml from '../yaml/yaml';

const ItemSelectionMixin = {
    data: function () {
        return {
            selected: false
        }
    },
    mounted: function () {
        this.clickSelectedBound = () => {
            if (!this.$root.selectmode) return;
            this.selected = !this.selected;
            this.updateSelection();
        }
        this.$el.addEventListener("click", this.clickSelectedBound);
    },
    beforeDestroy: function () {
        this.$el.removeEventListener("click", this.clickSelectedBound);
        if (this.selected) this.$root.selectedcounter -= 1;
    },
    methods: {
        updateSelection() {
            if (this.selected) {
                this.$el.classList.add("selected");
                this.$root.selectedcounter += 1;
            } else {
                this.$el.classList.remove("selected");
                this.$root.selectedcounter -= 1;
            }
        }
    }
}

const ListViewSelectionModeMixin = {
    data: function () {
        return {
            selectedcounter: 0,
            selectmode: false,
        }
    },
    watch: {
        selectedcounter: function () {
            document.dispatchEvent(new CustomEvent("selectionchanged", { detail: this.selectedcounter }));
        }
    },
    mounted: function () {
        this.filterbar = document.querySelector("ui-filter");
        if (this.filterbar) {
            this.selectmode = this.filterbar.selectmode;
            this.updateSelectModeBound = (event) => this.updateSelectMode(event);
            this.filterbar.addEventListener("selection", this.updateSelectModeBound);
        }
    },
    beforeDestroy: function () {
        if (this.filterbar) {
            this.filterbar.removeEventListener("selection", this.updateSelectModeBound);
            delete this.filterbar;
        }
    },
    methods: {
        itemsChangedInSelectionMode() {
            console.log("items changed while in selection mode");
        },
        updateSelectMode: function (event) {
            if (event.detail.action) {
                const action = event.detail.action;
                // There is one transition-group child and then all the item children
                const selected = this.$root.$children[0].$children.filter(e => e.selected);
                for (let child of selected) {
                    if (child[action]) child[action]();
                }
            }
            if (event.detail.selectmode !== undefined) {
                this.selectmode = event.detail.selectmode;
                if (this.selectWatcher) {
                    this.selectWatcher();
                    delete this.selectWatcher;
                }
                if (this.selectmode) {
                    // The return value is a function to dispose the watcher again
                    this.selectWatcher = this.$watch('items', this.itemsChangedInSelectionMode);
                    let count = 0;
                    var items = document.querySelectorAll("#listcontainer .listitem");
                    for (var item of items)
                        if (item.classList.contains("selected"))++count;
                    this.selectedcounter = count;
                }
            }
        },
    }
}

const ListModeMixin = {
    data: function () {
        return {
            viewmode: "list",
            hasMore: false
        }
    },
    mounted: function () {
        this.filterbar = document.querySelector("ui-filter");
        if (this.filterbar) {
            this.viewmode = this.filterbar.mode;
            this.updateViewModeBound = (event) => this.updateViewMode(event);
            this.filterbar.addEventListener("mode", this.updateViewModeBound);
        }
    },
    beforeDestroy: function () {
        if (this.filterbar) {
            this.filterbar.removeEventListener("mode", this.updateViewModeBound);
            delete this.filterbar;
        }
    },
    methods: {
        showMore: function () {
            if (this.filterbar) this.filterbar.dispatchEvent(new Event("showmore"));
        },
        updateViewMode: function (event) {
            this.viewmode = event.detail.mode;
        },
    }
};

const EditorMixin = {
    mounted: function () {
        this.editorActionsBar = document.querySelector("ui-filter");
        if (this.editorActionsBar) {
            this.editorEventBound = (event) => this.updateSelectMode(event);
            this.editorActionsBar.addEventListener("editor", this.filterbarEditorEvent);
        }
    },
    beforeDestroy: function () {
        if (this.editorActionsBar) {
            this.editorActionsBar.removeEventListener("editor", this.editorEventBound);
            delete this.editorActionsBar;
        }
    },
    methods: {
        filterbarEditorEvent: async function (event) {
            if (event.detail.discard) {
                this.$refs.editor.haschanges = false;
                this.$refs.editor.content = this.toTextual();
                this.editorActionsBar.setEditorContentChanged(false);
            } else if (event.detail.save) {
                try {
                    const jsonData = Yaml.parse(this.$refs.editor.content);
                    this.$refs.editor.readonly = true;
                    await this.saveAll(jsonData);
                    this.$refs.editor.readonly = false;
                } catch (e) {
                    this.$refs.editor.readonly = false;
                    const msg = `YAML is not valid! ${e}`;
                    this.editorActionsBar.setEditorContentChanged(true, msg);
                }
            }
        },
        editorContentChanged(editor) {
            const msg = `The selected ${editor.raw.length} objects are now protected from external changes. Submit when you are ready.`;
            this.editorActionsBar.setEditorContentChanged(true, msg);
        },
        toTextual() {
            if (this.$refs.editor && this.$refs.editor.haschanges) {
                console.warn("Editor content protected from change!");
                return null;
            }

            var items = JSON.parse(JSON.stringify(this.items));
            // Filter out the runtime keys in each item
            if (this.runtimeKeys) {
                for (var item of items) {
                    for (const runtimeKey of this.runtimeKeys)
                        delete item[runtimeKey];
                }
            }
            return {
                raw: items, value: Yaml.dump(items, 10, 4).replace(/-     /g, "-\n    "),
                language: 'yaml', modeluri: this.modelschema ? this.modelschema.uri : null
            };
        },
    }
};

export { ListModeMixin, EditorMixin, ListViewSelectionModeMixin, ItemSelectionMixin };