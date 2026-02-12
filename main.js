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

    set items(value) {
      this._items = value.split(",");
      this.render();
    }

    get items() {
      return this._items.join(",");
    }

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
          }

          .drag-over {
            border: 2px dashed #0073e6;
          }
        </style>

        <div class="container">
          ${this._items.map(item => `
            <div class="checkbox-item" draggable="true">
              <input type="checkbox" value="${item}" />
              ${item}
            </div>
          `).join("")}
        </div>
      `;

      this.addDragEvents();
    }

    addDragEvents() {
      const items = this._shadowRoot.querySelectorAll(".checkbox-item");

      items.forEach(item => {

        item.addEventListener("dragstart", (e) => {
          this._dragSrcEl = item;
          e.dataTransfer.effectAllowed = "move";
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

    updateOrder() {
      const newOrder = [];
      const items = this._shadowRoot.querySelectorAll(".checkbox-item");

      items.forEach(item => {
        newOrder.push(item.textContent.trim());
      });

      this._items = newOrder;

      this.dispatchEvent(new CustomEvent("onOrderChanged", {
        detail: { order: newOrder }
      }));
    }

  }

  customElements.define("com-dragdrop-checkbox", DragDropCheckbox);

})();
