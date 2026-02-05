(function () {

  const template = document.createElement("template");
  template.innerHTML = `
    <style>
      h4 { margin: 6px 0; font-family: Arial; }
      .zone {
        border: 1px dashed #999;
        min-height: 80px;
        padding: 6px;
        margin-bottom: 10px;
        font-family: Arial;
      }
      .dim {
        background: #f2f2f2;
        padding: 6px;
        margin: 4px 0;
        cursor: grab;
        border-radius: 4px;
      }
    </style>

    <h4>Rows</h4>
    <div id="rows" class="zone"></div>

    <h4>Columns</h4>
    <div id="columns" class="zone"></div>
  `;

  class DimLayoutController extends HTMLElement {

    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this.shadowRoot.appendChild(template.content.cloneNode(true));
    }

    // REQUIRED BY SAC
    onCustomWidgetBeforeUpdate(changedProperties) {
      if (changedProperties.tableId) {
        this.tableId = changedProperties.tableId;
      }
    }

    // REQUIRED BY SAC
    onCustomWidgetAfterUpdate() {
      this.syncFromTable();
      this.enableDnD("rows");
      this.enableDnD("columns");
    }

    // REQUIRED BY SAC
    onCustomWidgetResize() {}

    getTable() {
      return this.getRootNode()
        .getApplication()
        .getWidgetById(this.tableId || "Report_1");
    }

    syncFromTable() {
      const table = this.getTable();
      if (!table) return;

      const ds = table.getDataSource();
      this.renderAxis("rows", ds.getDimensionsOnRows());
      this.renderAxis("columns", ds.getDimensionsOnColumns());
    }

    renderAxis(id, dims) {
      const box = this.shadowRoot.getElementById(id);
      box.innerHTML = "";

      dims.forEach(dim => {
        const el = document.createElement("div");
        el.className = "dim";
        el.textContent = dim;
        el.dataset.dim = dim;
        el.draggable = true;

        el.addEventListener("dragstart", e => {
          e.dataTransfer.setData("text/plain", dim);
        });

        box.appendChild(el);
      });
    }

    enableDnD(id) {
      const box = this.shadowRoot.getElementById(id);

      box.ondragover = e => e.preventDefault();

      box.ondrop = e => {
        e.preventDefault();
        const dim = e.dataTransfer.getData("text/plain");
        const dragged = this.shadowRoot.querySelector(`[data-dim="${dim}"]`);
        if (dragged) box.appendChild(dragged);
        this.applyLayout();
      };
    }

    applyLayout() {
      const table = this.getTable();
      if (!table) return;

      const ds = table.getDataSource();

      ds.removeAllDimensionsFromRows();
      ds.removeAllDimensionsFromColumns();

      this.shadowRoot.querySelectorAll("#rows .dim")
        .forEach(el => ds.addDimensionToRows(el.dataset.dim));

      this.shadowRoot.querySelectorAll("#columns .dim")
        .forEach(el => ds.addDimensionToColumns(el.dataset.dim));
    }
  }

  customElements.define("dim-layout-controller", DimLayoutController);

})();
