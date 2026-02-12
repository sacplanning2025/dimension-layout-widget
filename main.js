(function () {

  class PlanningDragDrop extends HTMLElement {

    constructor() {
      super();
      this._shadowRoot = this.attachShadow({ mode: "open" });
      this._available = [];
      this._dragItem = null;
    }

    connectedCallback() {
      this.render();
    }

    // ===== PROPERTY FROM SAC =====
    setAvailable(items) {
      this._available = items || [];
      this.render();
    }

   getRows() {
  return this.getPanelValues("rowsList");
}

getColumns() {
  return this.getPanelValues("columnsList");
}

getAvailable() {
  return this.getPanelValues("availableList");
}
    // ===== RENDER UI =====
    render() {

      this._shadowRoot.innerHTML = `
        <style>
          .wrapper {
            display: flex;
            gap: 15px;
            font-family: Arial;
          }

          .panel {
            width: 30%;
            border: 1px solid #ccc;
            border-radius: 6px;
            padding: 8px;
            min-height: 300px;
            background: #fafafa;
          }

          .title {
            font-weight: bold;
            margin-bottom: 8px;
          }

          .item {
            padding: 6px;
            margin-bottom: 6px;
            background: #e6e6e6;
            border-radius: 4px;
            cursor: move;
          }

          .item:hover {
            background: #d4d4d4;
          }
        </style>

        <div class="wrapper">

          <div class="panel">
            <div class="title">Available</div>
            <div id="availableList">
              ${this._available.map(i => this.createItem(i)).join("")}
            </div>
          </div>

          <div class="panel">
            <div class="title">Rows</div>
            <div id="rowsList"></div>
          </div>

          <div class="panel">
            <div class="title">Columns</div>
            <div id="columnsList"></div>
          </div>

        </div>
      `;

      this.addDragEvents();
    }

    // ===== CREATE ITEM =====
    createItem(value) {
      return `<div class="item" draggable="true" data-value="${value}">${value}</div>`;
    }

    // ===== DRAG & DROP =====
    addDragEvents() {

      const lists = [
        this._shadowRoot.getElementById("availableList"),
        this._shadowRoot.getElementById("rowsList"),
        this._shadowRoot.getElementById("columnsList")
      ];

      const items = this._shadowRoot.querySelectorAll(".item");

      items.forEach(item => {

        item.addEventListener("dragstart", (e) => {
          this._dragItem = item;
          e.dataTransfer.effectAllowed = "move";
        });

        item.addEventListener("dragover", (e) => {
          e.preventDefault();
        });

        item.addEventListener("drop", (e) => {
          e.preventDefault();
          if (this._dragItem && this._dragItem !== item) {
            item.parentNode.insertBefore(this._dragItem, item);
            this.fireLayoutEvent();
          }
        });

      });

      lists.forEach(list => {

        list.addEventListener("dragover", (e) => {
          e.preventDefault();
        });

        list.addEventListener("drop", (e) => {
          e.preventDefault();
          if (this._dragItem) {
            list.appendChild(this._dragItem);
            this.fireLayoutEvent();
          }
        });

      });
    }

    // ===== GET PANEL VALUES =====
    getPanelValues(panelId) {
      const panel = this._shadowRoot.getElementById(panelId);
      const items = panel.querySelectorAll(".item");
      return Array.from(items).map(i => i.dataset.value);
    }

    // ===== FIRE EVENT TO SAC =====
   fireLayoutEvent() {

  this.dispatchEvent(new CustomEvent("onLayoutChanged", {
    detail: {
      rows: this.getRows(),
      columns: this.getColumns(),
      available: this.getAvailable()
    }
  }));
}

  }

  customElements.define("com-planning-dragdrop", PlanningDragDrop);

})();
