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
            display: flex;
            flex-direction: column;
          }

          .title {
            font-weight: bold;
            margin-bottom: 8px;
          }

          .search {
            margin-bottom: 8px;
            padding: 4px;
          }

          .list {
            flex-grow: 1;
            min-height: 200px;
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
            <input class="search" id="searchBox" placeholder="Search..." />
            <div id="availableList" class="list">
              ${this._available.map(i => this.createItem(i)).join("")}
            </div>
          </div>

          <div class="panel">
            <div class="title">Rows</div>
            <div id="rowsList" class="list"></div>
          </div>

          <div class="panel">
            <div class="title">Columns</div>
            <div id="columnsList" class="list"></div>
          </div>

        </div>
      `;

      this.addDragEvents();
      this.addSearch();
    }

    // ===== CREATE ITEM =====
    createItem(value) {
      return `<div class="item" draggable="true" data-value="${value}">${value}</div>`;
    }

    // ===== SEARCH FUNCTION =====
    addSearch() {

      const searchBox = this._shadowRoot.getElementById("searchBox");

      searchBox.addEventListener("input", (e) => {

        const value = e.target.value.toLowerCase();
        const items = this._shadowRoot.querySelectorAll("#availableList .item");

        items.forEach(item => {
          item.style.display =
            item.dataset.value.toLowerCase().includes(value)
              ? "block"
              : "none";
        });

      });
    }

    // ===== DRAG & DROP =====
    addDragEvents() {

      const shadow = this._shadowRoot;

      const available = shadow.getElementById("availableList");
      const rows = shadow.getElementById("rowsList");
      const columns = shadow.getElementById("columnsList");

      const panels = [available, rows, columns];

      const items = shadow.querySelectorAll(".item");

      items.forEach(item => {

        item.addEventListener("dragstart", (e) => {
          this._dragItem = item;
          e.dataTransfer.setData("text/plain", item.dataset.value);
          e.dataTransfer.effectAllowed = "move";
        });

      });

      panels.forEach(panel => {

        panel.addEventListener("dragover", (e) => {
          e.preventDefault();
        });

        panel.addEventListener("drop", (e) => {
          e.preventDefault();

          if (!this._dragItem) return;

          panel.appendChild(this._dragItem);
          this.fireLayoutEvent();
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
