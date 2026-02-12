(function () {

  class PlanningDragDrop extends HTMLElement {

    constructor() {
      super();
      this._shadowRoot = this.attachShadow({ mode: "open" });
      this._available = [];
      this._selected = [];
      this._dragItem = null;
    }

    connectedCallback() {
      this.render();
    }

    // ====== PROPERTIES ======
    set availableItems(val) {
      this._available = val ? val.split(",") : [];
      this.render();
    }

    set selectedItems(val) {
      this._selected = val ? val.split(",") : [];
      this.render();
    }

    // ====== METHODS ======
    setAvailable(arr) {
      this._available = arr;
      this.render();
    }

    setSelected(arr) {
      this._selected = arr;
      this.render();
    }

    getSelected() {
      return this._selected;
    }

    // ====== RENDER ======
    render() {

      this._shadowRoot.innerHTML = `
        <style>
          .wrapper {
            display: flex;
            gap: 15px;
            font-family: Arial;
          }

          .panel {
            width: 45%;
            border: 1px solid #ccc;
            border-radius: 6px;
            padding: 8px;
            min-height: 250px;
          }

          .title {
            font-weight: bold;
            margin-bottom: 6px;
          }

          .item {
            padding: 6px;
            margin-bottom: 4px;
            background: #f5f5f5;
            border-radius: 4px;
            cursor: move;
          }

          .item.drag-over {
            border: 2px dashed #0073e6;
          }

          input {
            width: 100%;
            margin-bottom: 6px;
          }
        </style>

        <div class="wrapper">

          <div class="panel" id="availablePanel">
            <div class="title">Available</div>
            <input type="text" placeholder="Search..." id="searchBox"/>
            <div id="availableList">
              ${this._available.map(i => this.createItemHTML(i)).join("")}
            </div>
          </div>

          <div class="panel" id="selectedPanel">
            <div class="title">Selected</div>
            <div id="selectedList">
              ${this._selected.map(i => this.createItemHTML(i)).join("")}
            </div>
          </div>

        </div>
      `;

      this.addDragDrop();
      this.addSearch();
    }

    createItemHTML(text) {
      return `<div class="item" draggable="true" data-value="${text}">${text}</div>`;
    }

    // ====== DRAG DROP ======
    addDragDrop() {

      const items = this._shadowRoot.querySelectorAll(".item");
      const availableList = this._shadowRoot.getElementById("availableList");
      const selectedList = this._shadowRoot.getElementById("selectedList");

      items.forEach(item => {

        item.addEventListener("dragstart", () => {
          this._dragItem = item;
        });

        item.addEventListener("dragover", e => {
          e.preventDefault();
          item.classList.add("drag-over");
        });

        item.addEventListener("dragleave", () => {
          item.classList.remove("drag-over");
        });

        item.addEventListener("drop", e => {
          e.preventDefault();
          item.classList.remove("drag-over");

          if (this._dragItem !== item) {
            item.parentNode.insertBefore(this._dragItem, item);
            this.syncArrays();
          }
        });
      });

      [availableList, selectedList].forEach(panel => {
        panel.addEventListener("dragover", e => e.preventDefault());

        panel.addEventListener("drop", e => {
          e.preventDefault();
          panel.appendChild(this._dragItem);
          this.syncArrays();
        });
      });
    }

    // ====== SEARCH ======
    addSearch() {
      const searchBox = this._shadowRoot.getElementById("searchBox");
      searchBox.addEventListener("input", e => {
        const value = e.target.value.toLowerCase();
        const items = this._shadowRoot.querySelectorAll("#availableList .item");

        items.forEach(item => {
          item.style.display = item.dataset.value.toLowerCase().includes(value)
            ? "block"
            : "none";
        });
      });
    }

    // ====== SYNC ======
    syncArrays() {
      const selectedItems = this._shadowRoot.querySelectorAll("#selectedList .item");
      this._selected = Array.from(selectedItems).map(i => i.dataset.value);

      const availableItems = this._shadowRoot.querySelectorAll("#availableList .item");
      this._available = Array.from(availableItems).map(i => i.dataset.value);

      this.dispatchEvent(new CustomEvent("onSelectionChanged", {
        detail: { selected: this._selected }
      }));
    }

  }

  customElements.define("com-planning-dragdrop", PlanningDragDrop);

})();
