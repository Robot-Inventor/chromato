import { LitElement, css, html } from "lit";
import { customElement, property, query } from "lit/decorators.js";

interface HandlePosition {
    x: number;
    y: number;
}

/**
 * Create and manage a draggable element.
 */
@customElement("draggable-element")
class DraggableElement extends LitElement {
    @property({ type: Boolean })
    public allowVertical?: boolean;

    @property({ type: Boolean })
    public allowHorizontal?: boolean;

    private offsetX: number | null;
    private offsetY: number | null;

    @query(".handle", true)
    private handle!: HTMLDivElement;

    @query(".container", true)
    private container!: HTMLDivElement;

    protected constructor() {
        super();
        this.offsetX = null;
        this.offsetY = null;
        this.allowVertical = true;
        this.allowHorizontal = true;
    }

    public static styles = css`
        :host {
            display: block;
            --handle-size: 1.5rem;
            --handle-color: #007bff;
        }

        * {
            box-sizing: border-box;
        }

        .container {
            position: relative;
            width: 100%;
            height: 100%;
        }

        .handle {
            position: absolute;
            width: var(--handle-size);
            height: var(--handle-size);
            border-radius: var(--handle-size);
            background: var(--handle-color);
            border: 0.2rem solid white;
            cursor: grab;
        }
    `;

    protected render() {
        return html`
            <div class="container">
                <div class="handle"></div>
            </div>
        `;
    }

    firstUpdated() {
        this.handle.addEventListener("mousedown", this.startDrag.bind(this));
        this.handle.addEventListener("touchstart", this.startDrag.bind(this));
        this.handle.addEventListener("touchend", this.stopDrag.bind(this));
        this.handle.addEventListener("touchmove", this.drag.bind(this));
        this.handle.addEventListener("mouseup", this.stopDrag.bind(this));
        this.handle.addEventListener("mousemove", this.drag.bind(this));
        document.addEventListener("mousemove", this.drag.bind(this));
        document.addEventListener("mouseup", this.stopDrag.bind(this));
        document.addEventListener("touchmove", this.drag.bind(this));
        document.addEventListener("touchend", this.stopDrag.bind(this));
    }

    private startDrag(event$: MouseEvent | TouchEvent) {
        event$.preventDefault();
        this.handle.style.cursor = "grabbing";
        const event = event$.type.includes("touch") ? (event$ as TouchEvent).touches[0] : (event$ as MouseEvent);
        this.offsetX = event.clientX - this.handle.offsetLeft;
        this.offsetY = event.clientY - this.handle.offsetTop;
    }

    private drag(event$: MouseEvent | TouchEvent) {
        if (this.offsetX === null || this.offsetY === null) return;

        const event = event$.type.includes("touch") ? (event$ as TouchEvent).touches[0] : (event$ as MouseEvent);
        let x = event.clientX - this.offsetX;
        let y = event.clientY - this.offsetY;

        const containerRect = this.container.getBoundingClientRect();
        const draggableRect = this.handle.getBoundingClientRect();

        if (!this.allowHorizontal) x = this.handle.offsetLeft;
        if (!this.allowVertical) y = this.handle.offsetTop;

        const handleWidth = draggableRect.width;
        const handleHeight = draggableRect.height;

        const containerWidth = containerRect.width;
        const containerHeight = containerRect.height;

        const handleHalfWidth = handleWidth / 2;
        const handleHalfHeight = handleHeight / 2;

        if (x < -handleHalfWidth) x = -handleHalfWidth;
        if (y < -handleHalfHeight) y = -handleHalfHeight;
        if (x + handleWidth > containerWidth + handleHalfWidth) {
            x = containerWidth - handleHalfWidth;
        }
        if (y + handleHeight > containerHeight + handleHalfHeight) {
            y = containerHeight - handleHalfHeight;
        }

        this.handle.style.left = `${x}px`;
        this.handle.style.top = `${y}px`;

        this.dispatchEvent(
            new CustomEvent("drag", {
                detail: {
                    x,
                    y
                }
            })
        );
    }

    private stopDrag() {
        this.handle.style.cursor = "grab";
        this.offsetX = null;
        this.offsetY = null;
    }

    public get handlePosition(): HandlePosition {
        const containerRect = this.container.getBoundingClientRect();
        const handleRect = this.handle.getBoundingClientRect();
        const x = (this.handle.offsetLeft + handleRect.width / 2) / containerRect.width;
        const y = (this.handle.offsetTop + handleRect.height / 2) / containerRect.height;

        return {
            x,
            y
        };
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "draggable-element": DraggableElement;
    }
}

export { DraggableElement };
