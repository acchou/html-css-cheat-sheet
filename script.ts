// These interface declarations allow for common DOM apis that are becoming available,
// without as much type casting. A little less safety in return for convenience in 
// a common case.
interface Node {
    prepend(...nodes: (Node | string)[]): void;
    append(...nodes: (Node | string)[]): void;
    before(...nodes: (Node | string)[]): void;
    after(...nodes: (Node | string)[]): void;
}

let div = document.createElement('div');
div.className = "section";
div.id = "html-inserted";
div.textContent = "hello world\n";

document.querySelector('section')!.appendChild(div);

let data = {
    "Fish": {
        "trout": {},
        "salmon": {}
    },

    "Tree": {
        "Huge": {
            "sequoia": {},
            "oak": {}
        },
        "Flowering": {
            "redbud": {},
            "magnolia": {}
        }
    }
};


function createTree(container: Element, data: any) {
    let keys = Object.keys(data);
    if (keys.length == 0) { return }
    let ul = document.createElement('ul');
    keys.forEach(child => {
        let li = document.createElement('li');
        li.textContent = child;
        ul.appendChild(li);
        createTree(ul, data[child]);
    })
    container.appendChild(ul);
}

createTree(div, data);

function processlist(list: HTMLUListElement) {
    let n = 0;
    Array.from(list.children).forEach(child => {
        let count = processitem(child as HTMLLIElement);
        n += count;
    });
    return n;
}

function processitem(item: HTMLLIElement) {
    let text = item.firstChild!;
    let n = 0;

    Array.from(item.children).forEach(child => {
        let count = processlist(child as HTMLUListElement);
        n += count;
    });
    if (n > 0) text.textContent += '[' + n + ']';
    return n + 1;
}

/* processlist(list); */

function annotateListItems() {
    let listItems = document.getElementsByTagName('li');
    for (let item of listItems) {
        let childItems = item.getElementsByTagName('li');
        let nChildren = childItems.length;
        if (nChildren > 0) {
            item.firstChild!.textContent += '[' + nChildren + ']'
        }
    }
}

annotateListItems();

function sortTable(table: HTMLTableElement, sortColumn: number) {
    let sortedRows = Array.from(table.rows)
        .slice(1)
        .sort((rowA, rowB) => rowA.cells[sortColumn].textContent! > rowB.cells[sortColumn].textContent! ? 1 : -1);
    table.rows[0].after(...sortedRows);
    let firstRow = table.rows[0];
}

function centerXY(elem: HTMLElement, container: Element) {
    let midY = container.clientHeight / 2;
    let midX = container.clientWidth / 2;
    let diameter = elem.offsetWidth;
    elem.style.top = Math.round(midY - diameter / 2) + 'px';
    elem.style.left = Math.round(midX - diameter / 2) + 'px';
}

let ball = document.getElementById("ball")!;
let field = document.getElementById("field")!;
centerXY(ball, field);

let coords = document.getElementById("coords")!;
document.onclick = function (e) { // shows click coordinates
    coords.innerHTML = e.clientX + ':' + e.clientY;
};

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

let clickmeButton = document.getElementById("clickmebutton")!;
let n = 0;
function clickmeHandler(event: MouseEvent) {
    alert(`${event.type} at ${event.currentTarget} Coordinates: ${event.clientX}, ${event.clientY}`);
    clickmeButton.insertAdjacentText("afterend", `clicked ${n} times`);
}

clickmeButton.addEventListener("click", clickmeHandler);

document.getElementById("hider")!.onclick = function () {
    document.getElementById("text")!.hidden = true;
}

document.getElementById("selfHider")!.onclick = function () {
    this.hidden = true;
}

let fieldClick = document.getElementById("fieldClick")!;

fieldClick.addEventListener("click", function (event) {
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
})

function toggleListControl(this: HTMLElement, event: Event) {
    this.parentElement!.classList.toggle("open");
}

Array.from(document.querySelectorAll(".menu > .title, .menu > .collapsed, .menu > .expanded")).forEach((title) => {
    title.addEventListener("click", toggleListControl);
});

let removeButton = document.getElementsByClassName("remove-button")[0] as HTMLElement;
Array.from(document.querySelectorAll(".pane")).forEach((pane) => {
    let button = removeButton.cloneNode(true) as HTMLButtonElement;
    pane.insertAdjacentElement("beforeend", button);
    button.addEventListener("click", () => pane.remove());
});

Array.from(document.querySelectorAll(".gallery")).forEach((gallery: HTMLElement) => {
    //let singleWidth = (<HTMLElement>gallery.firstElementChild.firstElementChild).offsetWidth;
    let singleWidth = 130;
    gallery.style.width = String(singleWidth * 3) + "px";
});

Array.from(document.querySelectorAll(".carousel")).forEach((carousel: HTMLElement) => {
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
});

document.getElementById("container")!.addEventListener("click", (event) => {
    let target = <Element>event.target;
    if (target.className != 'remove-button2') {
        return;
    }
    let pane = target.closest('.pane2');
    if (!pane) {
        return;
    }
    pane.remove();
});


Array.from(document.getElementsByClassName("tree")).forEach((tree) => {
    tree.addEventListener("click", (event) => {
        let li = (event.target as Element).closest("li") as HTMLLIElement;
        if (!li) {
            return;
        }
        Array.from(li.children).forEach((child: HTMLElement) => {
            child.hidden = !child.hidden;
        })
    });
});

// Sorting
function makeSortable(table: HTMLTableElement) {
    function doSort(tBody: HTMLTableSectionElement, index: number, type: string) {
        // Default to string compare.
        let compare = (a: string, b: string) => a.localeCompare(b);
        if (type === "number") {
            compare = (a: string, b: string) => +a - +b;
        }
        let sortedRows =
            Array.from(tBody.rows).sort((row1, row2) => {
                let a = row1.cells[index].textContent!;
                let b = row2.cells[index].textContent!;
                return compare(a, b);
            });
        tBody.append(...sortedRows);
    }

    table.tHead.addEventListener("click", event => {
        let target = event.target as Element;
        let th = target.closest("th") as HTMLTableHeaderCellElement;
        if (!th) { return; }
        if (table !== target.closest("table")) { return; }
        doSort(table.tBodies[0], th.cellIndex, th.dataset.type || "string");
    });
}

let grid = document.getElementById("grid") as HTMLTableElement;
makeSortable(grid);


// Simple tooltip that automatically shows above the target element that
// has the data-tooltip attribute.
let currentToolTip: HTMLElement | undefined;

document.addEventListener("mouseover", function (event) {
    let target = event.target as HTMLElement;
    let tip = target.dataset.tooltip;
    if (!tip) { return; }

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
});

document.addEventListener("mouseout", function (event) {
    if (currentToolTip) {
        currentToolTip.remove();
        currentToolTip = undefined;
    }
});

// Ask before following a link - example of preventing default 
// browser actions.
let contents = document.getElementById("contents") as HTMLElement;
contents.addEventListener("click", function (event) {
    let target = event.target as Element;
    let a = target.closest("A") as HTMLAnchorElement;
    if (!a || !contents.contains(target)) return;

    if (!confirm(`Are you sure you want to leave for ${a.href}`)) {
        event.preventDefault();
    }
});
