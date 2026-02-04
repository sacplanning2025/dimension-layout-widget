(function () {

  customElements.define(
    "dim-layout-controller",
    class extends HTMLElement {

      connectedCallback() {
        this.tableId = this.getProperty("tableId") || "Report_1";
        this.syncFromTable();
        this.enableDnD("rows");
        this.enableDnD("columns");
      }

      getTable() {
        return this.getRootNode()
          .getApplication()
          .getWidgetById(this.tableId);
      }

      syncFromTable() {
        const table = this.getTable();
        if (!table) {
          console.warn("Table not found:", this.tableId);
          return;
        }

        const ds = table.getDataSource();

        this.renderAxis("rows", ds.getDimensionsOnRows());
        this.renderAxis("columns", ds.getDimensionsOnColumns());
      }

      renderAxis(containerId, dimensions) {
        const box = document.getElementById(containerId);
        box.innerHTML = "";

        dimensions.forEach(dim => {
          const el = document.createElement("div");
          el.className = "dim";
          el.innerText = dim;
          el.dataset.dim = dim;
          el.draggable = true;

          el.addEventListener("dragstart", e => {
            e.dataTransfer.setData("text/plain", dim);
          });

          box.appendChild(el);
        });
      }

      enableDnD(containerId) {
        const box = document.getElementById(containerId);

        box.addEventListener("dragover", e => e.preventDefault());

        box.addEventListener("drop", e => {
          e.preventDefault();

          const dim = e.dataTransfer.getData("text/plain");
          const dragged = document.querySelector(`[data-dim="${dim}"]`);

          if (dragged && box !== dragged.parentNode) {
            box.appendChild(dragged);
          }

          this.applyLayout();
        });
      }

      applyLayout() {
        const table = this.getTable();
        if (!table) return;

        const ds = table.getDataSource();

        ds.removeAllDimensionsFromRows();
        ds.removeAllDimensionsFromColumns();

        document.querySelectorAll("#rows .dim").forEach(el => {
          ds.addDimensionToRows(el.dataset.dim);
        });

        document.querySelectorAll("#columns .dim").forEach(el => {
          ds.addDimensionToColumns(el.dataset.dim);
        });
      }
    }
  );

})();