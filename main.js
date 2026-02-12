(function () {

  class DragDropCheckbox extends HTMLElement {

    constructor() {
      super();
      this._shadowRoot = this.attachShadow({ mode: "open" });
      this._items = [];
      this._dragSrcEl = null;
    }

    connectedCallback() {
      this.render();
    }

    // ===== PROPERTY =====
    set items(value) {
      this._items = value ? value.split(",") : [];
      this.render();
    }

    get items() {
      return this._items.join(",");
    }

    // ===== METHODS FOR SAC =====
    setItems(itemsArray) {
      this._items = itemsArray;
      this.render();
    }

    getItems() {
      return this._items;
    }

    // ===== RENDER =====
    render() {

      this._shadowRoot.innerHTML = `
        <style>
          .container {
            display: flex;
            flex-direction: column;
            gap: 6px;
            font-family: Arial;
          }

          .checkbox-item {
            padding: 6px;
            border: 1px solid #ccc;
            border-radius: 4px;
            cursor: move;
            background: #f9f9f9;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .checkbox-item.drag-over {
            border: 2px dashed #0073e6;
          }

          .remove-btn {
            margin-left: auto;
            cursor: pointer;
            color: red;
            font-weight: bold;
          }

          button {
            margin-top: 8px;
            padding: 4px;
          }
        </style>

        <div class="container">
          ${this._items.map(item => `
            <div class="checkbox-item" draggable="true" data-value="${item}">
              <input type="checkbox" checked />
              <span>${item}</span>
              <span class="remove-btn">×</span>
            </div>
          `).join("")}
        </div>
      `;

      this.addDragEvents();
      this.addRemoveEvents();
    }

    // ===== DRAG EVENTS =====
    addDragEvents() {
      const items = this._shadowRoot.querySelectorAll(".checkbox-item");

      items.forEach(item => {

        item.addEventListener("dragstart", () => {
          this._dragSrcEl = item;
        });

        item.addEventListener("dragover", (e) => {
          e.preventDefault();
          item.classList.add("drag-over");
        });

        item.addEventListener("dragleave", () => {
          item.classList.remove("drag-over");
        });

        item.addEventListener("drop", (e) => {
          e.stopPropagation();

          if (this._dragSrcEl !== item) {
            const container = this._shadowRoot.querySelector(".container");
            container.insertBefore(this._dragSrcEl, item);
            this.updateOrder();
          }

          item.classList.remove("drag-over");
        });

      });
    }

    // ===== REMOVE ITEM =====
    addRemoveEvents() {
      const buttons = this._shadowRoot.querySelectorAll(".remove-btn");

      buttons.forEach(btn => {
        btn.addEventListener("click", (e) => {
          const item = e.target.closest(".checkbox-item");
          item.remove();
          this.updateOrder();
        });
      });
    }

    // ===== UPDATE ORDER =====
    updateOrder() {
      const newOrder = [];
      const items = this._shadowRoot.querySelectorAll(".checkbox-item");

      items.forEach(item => {
        newOrder.push(item.dataset.value);
      });

      this._items = newOrder;

      this.dispatchEvent(new CustomEvent("onOrderChanged", {
        detail: { order: newOrder }
      }));
    }

  }

  customElements.define("com-dragdrop-checkbox", DragDropCheckbox);

})();
