// These interface declarations allow for common DOM apis that are becoming available,
// without as much type casting. A little less safety in return for convenience in
// a common case.

interface Node {
    prepend(...nodes: (Node | string)[]): void;
    append(...nodes: (Node | string)[]): void;
    before(...nodes: (Node | string)[]): void;
    after(...nodes: (Node | string)[]): void;
}

interface HTMLCollectionOf<T extends Element> extends HTMLCollection {
    [Symbol.iterator](): IterableIterator<T>;
}

interface HTMLCollection {
    [Symbol.iterator](): IterableIterator<any>;
}

// Make HTMLCollection iterable with for...of loops
HTMLCollection.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];

//
// Utility functions
//
function documentScrollHeight(): number {
    return Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.offsetHeight,
        document.body.clientHeight,
        document.documentElement.clientHeight
    );
}

function documentScrollWidth(): number {
    return Math.max(
        document.body.scrollWidth,
        document.documentElement.scrollWidth,
        document.body.offsetWidth,
        document.documentElement.offsetWidth,
        document.body.clientWidth,
        document.documentElement.clientWidth
    );
}

function withinBounds(num: number, lower: number, upper: number) {
    return num >= lower && num <= upper;
}

function isVisible(elem: Element) {
    let rect = elem.getBoundingClientRect();
    let screenTop = 0;
    let screenBottom = document.documentElement.clientHeight;
    return (
        withinBounds(rect.top, screenTop, screenBottom) ||
        withinBounds(rect.bottom, screenTop, screenBottom)
    );
}

function preloadImages(sources: string[], callback: (images: HTMLImageElement[]) => void) {
    let images = new Array(sources.length);
    let nLoaded = 0;
    function onLoad() {
        if (++nLoaded == sources.length) {
            callback(images);
        }
    }
    for (let i = 0; i < sources.length; i++) {
        let image = document.createElement("img") as HTMLImageElement;
        image.src = sources[i];
        images[i] = image;
        image.addEventListener("load", onLoad);
        image.addEventListener("error", onLoad);
    }
}

function copyStyle(from: HTMLElement, to: HTMLElement) {
    let style = getComputedStyle(from);
    to.style.width = style.width;
    to.style.height = style.height;
    to.style.border = style.border;
    to.style.padding = style.padding;
    to.style.margin = style.margin;
    to.style.font = style.font;
}

function isSubset<T>(subset: Set<T>, ofSet: Set<T>) {
    for (let x of subset) {
        if (!ofSet.has(x)) {
            return false;
        }
    }
    return true;
}

// This is where the example code starts. Only do this after the
// load event to ensure image sizes are known, otherwise some code
// fails to work.
window.addEventListener("load", () => {
    //
    // Center ball on field.
    //
    function centerXY(elem: HTMLElement, container: Element) {
        let midY = container.clientHeight / 2;
        let midX = container.clientWidth / 2;
        let diameter = elem.offsetWidth;
        elem.style.top = Math.round(midY - diameter / 2) + "px";
        elem.style.left = Math.round(midX - diameter / 2) + "px";
    }

    let ball = document.getElementById("ball")!;
    let field = document.getElementById("field")!;

    centerXY(ball, field);

    //
    // Sort a table
    //
    function sortTable(table: HTMLTableElement, sortColumn: number) {
        let sortedRows = Array.from(table.rows)
            .slice(1)
            .sort(
                (rowA, rowB) =>
                    rowA.cells[sortColumn].textContent! > rowB.cells[sortColumn].textContent!
                        ? 1
                        : -1
            );
        table.rows[0].after(...sortedRows);
        let firstRow = table.rows[0];
    }
    sortTable(document.getElementById("table") as HTMLTableElement, 0);

    //
    // Insert list inside the end of the <section> tag
    //
    let div = document.createElement("div");
    div.className = "section";
    div.id = "html-inserted";
    div.textContent = "hello world\n";

    document.querySelector("section")!.appendChild(div);

    let data = {
        Fish: {
            trout: {},
            salmon: {}
        },

        Tree: {
            Huge: {
                sequoia: {},
                oak: {}
            },
            Flowering: {
                redbud: {},
                magnolia: {}
            }
        }
    };

    function createTree(container: Element, data: any) {
        let keys = Object.keys(data);
        if (keys.length == 0) return;

        let ul = document.createElement("ul");
        for (let child in data) {
            let li = document.createElement("li");
            li.textContent = child;
            ul.appendChild(li);
            createTree(ul, data[child]);
        }
        container.appendChild(ul);
    }

    createTree(div, data);

    //
    // Add annotations to unordered lists showing how many list items are underneath each.
    //
    function processlist(list: HTMLUListElement) {
        let n = 0;
        for (let child of list.children) {
            if (child instanceof HTMLLIElement) {
                let count = processitem(child);
                n += count;
            }
        }
        return n;
    }

    function processitem(item: HTMLLIElement) {
        let text = item.firstChild!;
        let n = 0;

        for (let child of item.children) {
            if (child instanceof HTMLUListElement) {
                let count = processlist(child);
                n += count;
            }
        }
        if (n > 0) text.textContent += "[" + n + "]";
        return n + 1;
    }

    // obsolete - better version below.
    // processlist(list);

    function annotateListItems() {
        let listItems = document.getElementsByTagName("li");
        for (let item of listItems) {
            let childItems = item.getElementsByTagName("li");
            let nChildren = childItems.length;
            if (nChildren > 0) {
                item.firstChild!.textContent += "[" + nChildren + "]";
            }
        }
    }

    annotateListItems();

    //
    // showing click coordinates
    //
    let coords = document.getElementById("coords")!;
    document.addEventListener("click", function(e) {
        // shows click coordinates
        coords.innerHTML = e.clientX + ":" + e.clientY;
    });

    function getCoords(elem: Element) {
        let bounds = elem.getBoundingClientRect();
        let upperLeft = { x: bounds.left, y: bounds.top };
        let lowerRight = { x: bounds.right, y: bounds.bottom };
        let style = getComputedStyle(elem);
        let upperLeftInner = {
            x: bounds.left + elem.clientLeft,
            y: bounds.top + elem.clientTop
        };
        let lowerRightInner = {
            x: bounds.left + elem.clientLeft + elem.clientWidth,
            y: bounds.bottom + elem.clientTop + elem.clientHeight
        };
    }

    //
    // Adding notes around an element - positioning
    //
    function positionAtFixed(anchor: Element, position: string, elem: HTMLElement) {
        let anchorBounds = anchor.getBoundingClientRect();
        let top, left;
        switch (position) {
            case "top":
                top = anchorBounds.top - elem.offsetHeight;
                left = anchorBounds.left;
                break;
            case "bottom":
                top = anchorBounds.bottom;
                left = anchorBounds.left;
                break;
            case "right":
                top = anchorBounds.top;
                left = anchorBounds.right;
                break;
            default:
                console.log("bad position: " + position);
                break;
        }
        elem.style.top = String(top) + "px";
        elem.style.left = String(left) + "px";
    }

    function showNoteFixed(anchor: Element, position: string, html: string) {
        let note = document.createElement("div");
        note.classList.add("note");
        note.innerHTML = html;
        note.style.position = "fixed";
        document.body.appendChild(note);
        positionAtFixed(anchor, position, note);
    }

    function getAbsoluteCoords(elem: Element) {
        let box = elem.getBoundingClientRect();

        return {
            top: box.top + pageYOffset,
            left: box.left + pageXOffset,
            bottom: box.bottom + pageYOffset,
            right: box.right + pageXOffset
        };
    }

    function positionAtAbsolute(anchor: Element, position: string, elem: HTMLElement) {
        let anchorBounds = getAbsoluteCoords(anchor);
        let top, left;
        switch (position) {
            case "top":
                top = anchorBounds.top - elem.offsetHeight;
                left = anchorBounds.left;
                break;
            case "bottom":
                top = anchorBounds.bottom;
                left = anchorBounds.left;
                break;
            case "right":
                top = anchorBounds.top;
                left = anchorBounds.right;
                break;
            case "top-in":
                top = anchorBounds.top;
                left = anchorBounds.left;
                break;

            case "bottom-in":
                top = anchorBounds.bottom - elem.clientHeight;
                left = anchorBounds.left;
                break;

            case "right-in":
                top = anchorBounds.top;
                left = anchorBounds.right - elem.clientWidth;
                break;

            default:
                console.log("bad position: " + position);
                break;
        }
        elem.style.top = String(top) + "px";
        elem.style.left = String(left) + "px";
    }

    function showNoteAbsolute(anchor: Element, position: string, html: string) {
        let note = document.createElement("div");
        note.classList.add("note");
        note.innerHTML = html;
        note.style.position = "absolute";
        document.body.appendChild(note);
        positionAtAbsolute(anchor, position, note);
    }

    let blockquote = document.querySelector("blockquote")!;
    showNoteAbsolute(blockquote, "top", "note above");
    showNoteAbsolute(blockquote, "right", "note at right");
    showNoteAbsolute(blockquote, "bottom", "note below");
    showNoteAbsolute(blockquote, "top-in", "note top in");
    showNoteAbsolute(blockquote, "bottom-in", "note bottom in");
    showNoteAbsolute(blockquote, "right-in", "note right in");

    document.body.style.height = "2000px";

    //
    // Button click events.
    //
    let clickmeButton = document.getElementById("clickmebutton")!;
    let n = 0;
    function clickmeHandler(event: MouseEvent) {
        alert(
            `${event.type} at ${event.currentTarget} Coordinates: ${event.clientX}, ${event.clientY}`
        );
        clickmeButton.insertAdjacentText("afterend", `clicked ${n} times`);
    }

    clickmeButton.addEventListener("click", clickmeHandler);

    //
    // Hiding buttons
    //
    document.getElementById("hider")!.onclick = function() {
        document.getElementById("text")!.hidden = true;
    };

    document.getElementById("selfHider")!.onclick = function() {
        this.hidden = true;
    };

    //
    // Animating "click to move" - ball on field.
    //
    let fieldClick = document.getElementById("fieldClick")!;

    fieldClick.addEventListener("click", function(event) {
        let ballClick = document.getElementById("ballClick")!;
        let fieldRect = fieldClick.getBoundingClientRect()!;
        let x = event.clientX - fieldRect.left - field.clientLeft - ballClick.clientWidth / 2;
        let y = event.clientY - fieldRect.top - field.clientTop - ballClick.clientHeight / 2;
        x = Math.max(x, 0);
        x = Math.min(x, fieldClick.clientWidth - ballClick.clientWidth);

        y = Math.max(y, 0);
        y = Math.min(y, fieldClick.clientHeight - ballClick.clientHeight);

        ballClick.style.top = String(y) + "px";
        ballClick.style.left = String(x) + "px";
    });

    //
    // Simple list control - expand and collapse
    //
    function toggleListControl(this: HTMLElement, event: Event) {
        this.parentElement!.classList.toggle("open");
    }

    for (let title of document.querySelectorAll(
        ".menu > .title, .menu > .collapsed, .menu > .expanded"
    )) {
        title.addEventListener("click", toggleListControl);
    }

    //
    // Remove button.
    //
    let removeButton = document.getElementsByClassName("remove-button")[0] as HTMLElement;
    for (let pane of document.querySelectorAll(".pane")) {
        let button = removeButton.cloneNode(true) as HTMLButtonElement;
        pane.insertAdjacentElement("beforeend", button);
        button.addEventListener("click", () => pane.remove());
    }

    //
    // Image Gallery with animated scrolling.
    //
    for (let gallery of document.querySelectorAll(".gallery")) {
        //let singleWidth = (<HTMLElement>gallery.firstElementChild.firstElementChild).offsetWidth;
        let singleWidth = 130;
        (<HTMLElement>gallery).style.width = String(singleWidth * 3) + "px";
    }

    for (let carousel of document.querySelectorAll(".carousel")) {
        let leftArrow = carousel.querySelector(".arrow.left") as HTMLButtonElement;
        let rightArrow = carousel.querySelector(".arrow.right") as HTMLButtonElement;
        let list = carousel.querySelector(".gallery > ul") as HTMLElement;
        let position = 0;
        leftArrow.addEventListener("click", (event: Event) => {
            let newPosition = position + list.clientWidth;
            if (newPosition <= 0) {
                position = newPosition;
                list.style.transform = `translateX(${position}px)`;
            }
        });
        rightArrow.addEventListener("click", (event: Event) => {
            let newPosition = position - list.clientWidth;
            if (newPosition >= -list.scrollWidth) {
                position = newPosition;
                list.style.transform = `translateX(${position}px)`;
            }
        });
    }

    //
    // Remove button - this time with a single handler on the container,
    // using event delegation.
    //
    document.getElementById("container")!.addEventListener("click", event => {
        let target = <Element>event.target;
        if (target.className != "remove-button2") return;

        let pane = target.closest(".pane2");
        if (!pane) return;

        pane.remove();
    });

    //
    // Collapsible tree control.
    //
    for (let tree of document.getElementsByClassName("tree")) {
        tree.addEventListener("click", event => {
            if (!(event.target instanceof Element)) return;
            let li = event.target.closest("li") as HTMLLIElement;
            if (!li) return;

            for (let child of li.children) {
                child.hidden = !child.hidden;
            }
        });
    }

    //
    // Sortable table by clicking on header
    //
    function makeSortable(table: HTMLTableElement) {
        function doSort(tBody: HTMLTableSectionElement, index: number, type: string) {
            // Default to string compare.
            let compare = (a: string, b: string) => a.localeCompare(b);
            if (type === "number") {
                compare = (a: string, b: string) => +a - +b;
            }
            let sortedRows = Array.from(tBody.rows).sort((row1, row2) => {
                let a = row1.cells[index].textContent!;
                let b = row2.cells[index].textContent!;
                return compare(a, b);
            });
            tBody.append(...sortedRows);
        }

        table.tHead.addEventListener("click", event => {
            let target = event.target;
            if (!(target instanceof HTMLElement)) return;
            let th = target.closest("th") as HTMLTableHeaderCellElement;
            if (!th) return;
            if (table !== target.closest("table")) return;

            doSort(table.tBodies[0], th.cellIndex, th.dataset.type || "string");
        });
    }

    let grid = document.getElementById("grid") as HTMLTableElement;
    makeSortable(grid);

    //
    // Tooltip - for any element with the "data-tooltip" attribute.
    // Doesn't work for nested elements.
    //
    let currentToolTip: HTMLElement | undefined;

    function showToolTip(target: HTMLElement, tip: string) {
        if (currentToolTip) {
            currentToolTip.remove();
        }
        currentToolTip = document.createElement("div");
        currentToolTip.classList.add("tooltip");
        currentToolTip.innerHTML = tip;
        target.before(currentToolTip);
        let top;
        let rect = target.getBoundingClientRect();
        top = rect.top - currentToolTip.offsetHeight - 4;
        // Tooltip shows below the element if it won't fit above it.
        if (top < 0) {
            top = rect.top + target.offsetHeight + 4;
        }
        currentToolTip.style.top = top + "px";
        currentToolTip.style.left = rect.left + "px";
    }

    function addToolTipsBasic() {
        document.addEventListener("mouseover", function(event) {
            let target = event.target;
            if (target instanceof HTMLElement) {
                let tip = target.dataset.tooltip;
                if (!tip) return;
                showToolTip(target, tip);
            }
        });
        document.addEventListener("mouseout", function(event) {
            if (currentToolTip) {
                currentToolTip.remove();
                currentToolTip = undefined;
            }
        });
    }

    //
    // Confirm before following a link - example of preventing default
    // browser actions.
    //
    let contents = document.getElementById("contents") as HTMLElement;
    contents.addEventListener("click", function(event) {
        let target = event.target;
        if (!(target instanceof Element)) return;
        let a = target.closest("A") as HTMLAnchorElement;
        if (!a || !contents.contains(target)) return;

        if (!confirm(`Are you sure you want to leave for ${a.href}`)) {
            event.preventDefault();
        }
    });

    //
    // Selectable list with multi-select using Ctrl/Cmd + click.
    //
    let selectList = document.getElementById("select-list")!;
    selectList.addEventListener("click", event => {
        let target = event.target;
        if (!(target instanceof HTMLLIElement)) return;
        // Clear selected if ctrl/cmd are not pressed
        if (!event.ctrlKey && !event.metaKey) {
            for (let li of selectList.querySelectorAll(".selected")) {
                li.classList.remove("selected");
            }
        }
        target.classList.add("selected");
    });

    // Don't select text when clicking on list items.
    selectList.addEventListener("mousedown", event => {
        event.preventDefault();
    });

    //
    // Tooltip that works with nested elements
    //
    function addToolTipsNested() {
        document.addEventListener("mouseover", function(event) {
            let target = event.target;
            if (!(target instanceof HTMLElement)) return;
            let anchor = target.closest("[data-tooltip]");
            if (!(anchor instanceof HTMLElement)) {
                if (currentToolTip) {
                    currentToolTip.remove();
                }
                return;
            }
            let tip = anchor.dataset.tooltip;
            if (!tip) return;
            showToolTip(anchor, tip);
        });
    }

    addToolTipsNested();

    //
    // Drag and drop
    //
    interface DraggableDelegate {
        leaveDropTarget: (elem: HTMLElement) => void;
        enterDropTarget: (elem: HTMLElement) => void;
    }

    function createDraggableEventHandler({ leaveDropTarget, enterDropTarget }: DraggableDelegate) {
        let currentDropTarget: HTMLElement | undefined;

        return function(event: MouseEvent) {
            let target = event.target as HTMLElement;
            if (!(target instanceof HTMLElement)) return;
            let rect = target.getBoundingClientRect();
            let offsetX = event.clientX - rect.left;
            let offsetY = event.clientY - rect.top;

            target.style.position = "absolute";
            target.style.zIndex = "1000";
            document.body.appendChild(target);
            moveTarget(event.pageX, event.pageY);

            function moveTarget(x: number, y: number) {
                // Absolute position with parent = window.
                // Therefore top and left are relative to the entire document body.
                target.style.top = y - offsetY + "px";
                target.style.left = x - offsetX + "px";
            }

            function mouseMoveHandler(event: MouseEvent) {
                moveTarget(event.pageX, event.pageY);

                target.hidden = true;
                let mouseOverElem = document.elementFromPoint(event.clientX, event.clientY);
                target.hidden = false;

                if (currentDropTarget != mouseOverElem) {
                    if (currentDropTarget) {
                        leaveDropTarget(currentDropTarget);
                    }

                    if (mouseOverElem instanceof HTMLElement) {
                        currentDropTarget = mouseOverElem;
                        if (currentDropTarget) {
                            enterDropTarget(currentDropTarget);
                        }
                    }
                }
            }

            document.addEventListener("mousemove", mouseMoveHandler);

            target.onmouseup = function() {
                document.removeEventListener("mousemove", mouseMoveHandler);
                target.onmouseup = () => {};
            };
        };
    }

    function describeBounds(bounds: ClientRect) {
        return bounds.top + ", " + bounds.left;
    }

    function makeDraggable(element: HTMLElement, draggableCallbacks: DraggableDelegate) {
        // Don't use browser's default action.
        element.ondragstart = function() {
            return false;
        };

        element.addEventListener("mousedown", createDraggableEventHandler(draggableCallbacks));
    }

    let ballDrag = document.getElementById("ballDrag") as HTMLElement;

    makeDraggable(ballDrag, {
        leaveDropTarget(elem) {
            let bounds = elem.getBoundingClientRect();
            console.log("leaveDropTarget " + elem.tagName + " " + describeBounds(bounds));
        },
        enterDropTarget(elem) {
            let bounds = elem.getBoundingClientRect();
            console.log("enterDropTarget " + elem.tagName + " " + describeBounds(bounds));
        }
    });

    interface SliderDelegate {
        sliderPositionChanged: (percentage: number) => void;
    }

    function makeSlider(
        slider: HTMLElement,
        thumb: HTMLElement,
        { sliderPositionChanged }: SliderDelegate
    ) {
        thumb.ondragstart = function() {
            return false;
        };

        function moveThumb(event: MouseEvent) {
            let thumbMidPointOffset = thumb.clientWidth / 2;
            let sliderRect = slider.getBoundingClientRect();
            let thumbPos = event.clientX - sliderRect.left - thumbMidPointOffset;
            thumb.style.position = "relative";

            if (thumbPos < 0) {
                thumbPos = 0;
            }
            let maxPos = slider.offsetWidth - thumb.offsetWidth + thumbMidPointOffset;
            if (thumbPos > maxPos) {
                thumbPos = maxPos;
            }
            thumb.style.left = thumbPos + "px";
            sliderPositionChanged(thumbPos / maxPos);
        }

        slider.addEventListener("mousedown", function(event) {
            event.preventDefault();
            moveThumb(event);
            document.addEventListener("mousemove", moveThumb);
        });

        document.addEventListener("mouseup", function() {
            document.removeEventListener("mousemove", moveThumb);
        });
    }

    let slider = document.querySelector(".slider") as HTMLElement;
    let thumb = document.querySelector(".thumb") as HTMLElement;

    makeSlider(slider, thumb, {
        sliderPositionChanged(pos) {
            console.log("slider pos: " + pos);
        }
    });

    //
    // Hero example
    //
    document.addEventListener("mousedown", function(event) {
        let elem = document.elementFromPoint(event.clientX, event.clientY);
        if (!elem) return;
        let draggable = elem.closest(".draggable") as HTMLElement;
        if (!draggable || !(draggable instanceof HTMLElement)) return;

        event.preventDefault();
        let rect = draggable.getBoundingClientRect();
        let offsetX = event.clientX - rect.left;
        let offsetY = event.clientY - rect.top;

        draggable.style.position = "fixed";
        draggable.style.top = rect.top + "px";
        draggable.style.left = rect.left + "px";

        document.body.appendChild(draggable);
        setTimeout({}, 0);

        draggable.ondragstart = function() {
            return false;
        };

        function moveDraggable(event: MouseEvent) {
            let left = event.clientX - offsetX;
            let top = event.clientY - offsetY;
            let rect = draggable.getBoundingClientRect();

            // Scrolling
            if (rect.top <= 0) {
                scrollBy(0, -20);
            }

            let windowHeight = document.documentElement.clientHeight;
            if (rect.bottom >= windowHeight) {
                scrollBy(0, 20);
            }

            // Ensure draggable stays fully onscreen.
            if (left < 0) left = 0;
            let clientWidth = document.documentElement.clientWidth;
            left = Math.min(left, clientWidth - rect.width);

            if (top < 0) top = 0;
            let clientHeight = document.documentElement.clientHeight;
            top = Math.min(top, clientHeight - rect.height);

            draggable.style.left = left + "px";
            draggable.style.top = top + "px";
        }

        document.addEventListener("mousemove", moveDraggable);

        function mouseUpHandler(event: MouseEvent) {
            let rect = draggable.getBoundingClientRect();
            let top = pageYOffset + rect.top;
            let left = pageXOffset + rect.left;
            draggable.style.top = top + "px";
            draggable.style.left = left + "px";
            draggable.style.position = "absolute";
            document.removeEventListener("mousemove", moveDraggable);
            document.removeEventListener("mouseup", mouseUpHandler);
        }

        document.addEventListener("mouseup", mouseUpHandler);
    });

    //
    // Scrolling - green arrow for returning to top
    //
    let matrix = document.getElementById("matrix") as HTMLElement;
    let arrow = document.getElementById("arrowTop") as HTMLElement;
    matrix.addEventListener("scroll", function(event: Event) {
        event.preventDefault();
        if (matrix.scrollTop < matrix.clientHeight) {
            arrow.style.visibility = "hidden";
        } else {
            arrow.style.visibility = "visible";
        }
    });

    arrow.addEventListener("click", function(event: MouseEvent) {
        matrix.scrollTop = 0;
    });

    //
    // Load images on demand
    //

    let images = document.querySelectorAll("img[data-src]") as NodeListOf<HTMLImageElement>;
    for (let image of images) {
        function imageLoader() {
            if (isVisible(image)) {
                let src = image.dataset["src"];
                if (src) {
                    image.src = src + "?nocache=" + Math.random();
                }
                document.removeEventListener("scroll", imageLoader);
            }
        }
        if (isVisible(image)) {
            imageLoader();
        } else {
            document.addEventListener("scroll", imageLoader);
        }
    }

    //
    // Add an option to select
    //

    let genres = document.getElementById("genres") as HTMLSelectElement;
    genres.options.add(new Option("Jazz", "jazz", true, true), 0);

    //
    // Add a tabindex (to allow focusing) to all codeblocks
    //
    let codeblocks = document.querySelectorAll(".codeblock");
    let tabIndex = 1;
    for (let codeblock of codeblocks) {
        codeblock.setAttribute("tabindex", String(tabIndex++));
    }

    //
    // Turn a div into an editable textarea
    //
    let view = document.getElementById("view") as HTMLElement;
    view.tabIndex = 1;
    view.addEventListener("focus", () => {
        let textArea = document.createElement("textarea");
        textArea.textContent = view.innerHTML;
        copyStyle(view, textArea);
        textArea.addEventListener("blur", () => {
            view.innerHTML = textArea.value;
            textArea.after(view);
            textArea.remove();
        });
        view.after(textArea);
        view.remove();
        textArea.focus();
    });

    //
    // Interest calculator that updates immediately on every input value change
    //
    let heightAfter = document.getElementById("height-after") as HTMLElement;
    let heightBefore = document.getElementById("height-before") as HTMLElement;
    let moneyBefore = document.getElementById("money-before") as HTMLElement;
    let moneyAfter = document.getElementById("money-after") as HTMLElement;
    let form = document.forms[0] as HTMLFormElement;
    let initialDeposit = form.money as HTMLInputElement;
    let months = form.months as HTMLSelectElement;
    let interest = form.interest as HTMLInputElement;

    function updateChart() {
        let before = Number(initialDeposit.value);
        if (before) {
            moneyBefore.textContent = "$" + before;
        } else {
            moneyBefore.textContent = "$0";
        }

        let multiple = Math.pow(1 + Number(interest.value) / 100, Number(months.value) / 12);
        if (multiple > 0) {
            let after = Math.round(before * multiple);
            moneyAfter.textContent = "$" + after;
            heightAfter.style.height =
                heightBefore.getBoundingClientRect().height * (after / before) + "px";
        } else {
            heightAfter.style.height = "0";
            moneyAfter.textContent = "$0";
        }
    }

    initialDeposit.addEventListener("input", () => updateChart());
    months.addEventListener("input", () => updateChart());
    interest.addEventListener("input", () => updateChart());
    updateChart();

    //
    // Modal prompt
    //
    function showPrompt(html: string, callback: (value: string | null) => void) {
        let container = document.querySelector(".prompt-form-container") as HTMLElement;
        let form = document.getElementById("prompt-form") as HTMLFormElement;
        let message = form.querySelector("#prompt-message") as HTMLElement;
        let input = form.input as HTMLInputElement;

        message.innerHTML = html;
        input.value = "";

        let pane = document.createElement("div") as HTMLElement;
        pane.classList.add("semitransparent");

        function show() {
            document.body.appendChild(pane);
            document.body.style.overflow = "hidden";
            container.style.display = "flex";
            input.focus();
        }

        function hide() {
            pane.remove();
            document.body.style.overflow = "scroll";
            container.style.display = "none";
        }

        form.onsubmit = event => {
            event.preventDefault();
            hide();
            callback(input.value);
        };

        let cancel = form.cancel as HTMLInputElement;
        cancel.onclick = event => {
            hide();
            callback(null);
        };

        show();
    }

    let formButton = document.getElementById("modal-form-button") as HTMLButtonElement;
    formButton.addEventListener("click", () =>
        showPrompt("Hi there", (value: string) => alert("you typed " + value))
    );

    let flyjet = document.getElementById("flyjet") as HTMLElement;
    flyjet.addEventListener("click", () => {
        flyjet.classList.add("growing");
    });

    //
    // Circle animation example
    //
    function showCircle(
        inElem: HTMLElement,
        cx: number,
        cy: number,
        radius: number,
        callback?: (div: HTMLElement) => void
    ) {
        let circle = document.createElement("div");
        circle.classList.add("circle");
        inElem.appendChild(circle);
        circle.style.width = circle.style.height = 0 + "px";
        circle.style.top = cy + "px";
        circle.style.left = cx + "px";

        setTimeout(() => {
            circle.style.height = circle.style.width = radius * 2 + "px";

            circle.addEventListener("transitionend", function handler() {
                circle.removeEventListener("transitionend", handler);
                if (callback) {
                    callback(circle);
                }
            });
        }, 0);
    }

    let circleExample = document.getElementById("circleExample") as HTMLElement;
    let circleButton = document.getElementById("circleButton") as HTMLElement;
    circleButton.addEventListener("click", () => showCircle(circleExample, 200, 200, 100));

    let circleExampleCallback = document.getElementById("circleExampleCallback") as HTMLElement;
    let circleButtonCallback = document.getElementById("circleButtonCallback") as HTMLElement;
    circleButtonCallback.addEventListener("click", () =>
        showCircle(circleExampleCallback, 200, 200, 100, div => {
            div.classList.add("circleMessage");
            div.append("Hello I'm done!");
        })
    );

    //
    // showCircle with promises instead of callbacks
    //
    function showCirclePromise(inElem: HTMLElement, cx: number, cy: number, radius: number) {
        let circle = document.createElement("div");
        circle.classList.add("circle");
        inElem.appendChild(circle);
        circle.style.width = circle.style.height = 0 + "px";
        circle.style.top = cy + "px";
        circle.style.left = cx + "px";

        return new Promise(resolve => {
            setTimeout(() => {
                circle.style.height = circle.style.width = radius * 2 + "px";
                circle.addEventListener("transitionend", function handler() {
                    circle.removeEventListener("transitionend", handler);
                    resolve(circle);
                });
            }, 0);
        });
    }

    let circleExamplePromise = document.getElementById("circleExamplePromise") as HTMLElement;
    let circleButtonPromise = document.getElementById("circleButtonPromise") as HTMLElement;
    circleButtonPromise.addEventListener("click", () =>
        showCirclePromise(circleExamplePromise, 200, 200, 100).then((div: HTMLElement) => {
            div.classList.add("circleMessage");
            div.append("Hello I'm done!");
        })
    );

    //
    // Delay with promise
    //
    function delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    let delayButton = document.getElementById("delayButton") as HTMLButtonElement;
    delayButton.addEventListener("click", () => delay(3000).then(() => alert("runs after 3s")));

    //
    // async / await examples
    //
    function loadJson(url: string) {
        return fetch(url).then(response => {
            if (response.status == 200) {
                return response.json();
            } else {
                throw new Error(String(response.status));
            }
        });
    }

    async function loadJsonAsync(url: string) {
        let response = await fetch(url);
        if (response.status == 200) {
            return response.json();
        }
        throw new Error(String(response.status));
    }

    // loadJson("missing.json").catch(alert);

    class HttpError extends Error {
        response: Response;

        constructor(response: Response) {
            super(`${response.status} for ${response.url}`);
            this.name = "HttpError";
            this.response = response;
        }
    }

    async function loadJson2(url: string) {
        let response = await fetch(url);
        if (response.status == 200) {
            return response.json();
        }
        throw new HttpError(response);
    }

    async function demoGithubUser(): Promise<any> {
        let name = prompt("Enter a name?", "acchou");

        try {
            let user = await loadJson2(`https://api.github.com/users/${name}`);
            alert(`full name: ${user.name}`);
            return user;
        } catch (error) {
            if (error instanceof HttpError && error.response.status == 404) {
                alert("No such user, please reenter.");
                return demoGithubUser();
            }
            throw error;
        }
    }

    //
    // Github profile example
    //

    let githubUserName = document.getElementById("githubUserNameInput") as HTMLInputElement;

    interface GithubUser {
        login: string;
        id: number;
        avatar_url: string;
        gravatar_id: string;
        url: string;
        html_url: string;
        followers_url: string;
        following_url: string;
        gists_url: string;
        starred_url: string;
        subscriptions_url: string;
        organizations_url: string;
        repos_url: string;
        events_url: string;
        received_events_url: string;
        type: string;
        site_admin: boolean;
        name: string;
        company: string;
        blog: string;
        location: string;
        email: string | null;
        hireable: string | null;
        bio: string | null;
        public_repos: number;
        public_gists: number;
        followers: number;
        following: number;
        created_at: string;
        updated_at: string;
    }

    function get(id: string) {
        return document.getElementById(id) as HTMLElement;
    }

    let avatar = get("githubAvatar") as HTMLImageElement;
    let errorMessage = get("error");
    let githubName = get("githubName");
    let githubBlog = get("githubBlog");
    let githubLogin = get("githubLogin");

    function clearProfile() {
        avatar.src = "";
        errorMessage.textContent = "";
        githubName.textContent = "";
        githubBlog.textContent = "";
        githubLogin.textContent = "";
    }

    async function fetchGitHubProfile(userName: string) {
        try {
            let user = <GithubUser>await loadJson2(`https://api.github.com/users/${userName}`);
            errorMessage.textContent = "";
            avatar.src = user.avatar_url;
            githubName.textContent = user.name;
            githubBlog.textContent = user.blog;
            githubLogin.textContent = user.login;
            return user;
        } catch (error) {
            clearProfile();
            if (error instanceof HttpError) {
                errorMessage.textContent = `${error.name}: ${error.message}`;
            }
        }
    }

    githubUserName.addEventListener("input", event => fetchGitHubProfile(githubUserName.value));

    //let githubUser = demoGithubUser();
});

//
// Preload images
//
let sources = [
    "https://en.js.cx/images-load/1.jpg",
    "https://en.js.cx/images-load/2.jpg",
    "https://en.js.cx/images-load/3.jpg"
];

// add random characters to prevent browser caching
for (let i = 0; i < sources.length; i++) {
    sources[i] += "?" + Math.random();
}

// for each image,
// let's create another img with the same src and check that we have its width immediately
function testLoaded(images: HTMLImageElement[]) {
    let preloadElement = document.getElementById("preload") as HTMLElement;
    let widthSum = 0;
    for (let i = 0; i < sources.length; i++) {
        let img = document.createElement("img");
        img.src = sources[i];
        widthSum += img.width;
    }
    preloadElement.append(...images);
    let widthSumElem = document.createTextNode("widthSum = " + widthSum + " (should be 300)");
    preloadElement.append(widthSumElem);
}

// every image is 100x100, the total width should be 300
preloadImages(sources, testLoaded);

//
// Extended Hotkeys example
//
function runOnKeys(f: () => void, ...codes: string[]) {
    let currentlyPressedKeys = new Set();
    let hotKeys = new Set(codes);
    document.addEventListener("keydown", event => {
        currentlyPressedKeys.add(event.code);
        if (isSubset(hotKeys, currentlyPressedKeys)) {
            f();
            currentlyPressedKeys.clear();
        }
    });
    document.addEventListener("keyup", event => currentlyPressedKeys.delete(event.code));
}

runOnKeys(() => alert("Pressed hotkey!"), "KeyQ", "KeyW");
