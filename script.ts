'use strict';

let div = document.createElement('div');
div.className = "section";
div.id = "html-inserted";
div.textContent = "hello world\n";

document.querySelector('section').appendChild(div);

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
    let text = item.firstChild;
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
            item.firstChild.textContent += '[' + nChildren + ']'
        }
    }
}

annotateListItems();

function sortTable(table: HTMLTableElement, sortColumn: number) {
    let sortedRows = Array.from(table.rows)
        .slice(1)
        .sort((rowA, rowB) => rowA.cells[sortColumn].textContent > rowB.cells[sortColumn].textContent ? 1 : -1);
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

let ball = document.getElementById("ball");
let field = document.getElementById("field");
centerXY(ball, field);

let coords = document.getElementById("coords");
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

let blockquote = document.querySelector("blockquote");
showNoteAbsolute(blockquote, "top", "note above");
showNoteAbsolute(blockquote, "right", "note at right");
showNoteAbsolute(blockquote, "bottom", "note below");
showNoteAbsolute(blockquote, "top-in", "note top in");
showNoteAbsolute(blockquote, "bottom-in", "note bottom in");
showNoteAbsolute(blockquote, "right-in", "note right in");
document.body.style.height = "2000px";