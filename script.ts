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


function createTree(container, data) {
    let keys = Object.keys(data);
    if (keys.length == 0) { return }
    let ul = document.createElement('ul');
    keys.forEach(child => {
        let li = document.createElement('li');
        li.textContent = child;
        ul.appendChild(li);
        createTree(ul, data[child]);
    })
    container.append(ul);
}

createTree(div, data);

function processlist(list) {
    let n = 0;
    for (let child of list.children) {
        let count = processitem(child);
        n += count;
    }
    return n;
}

function processitem(item) {
    let text = item.firstChild;
    let n = 0;
    for (let child of item.children) {
        let count = processlist(child);
        n += count;
    }
    if (n > 0) text.data += '[' + n + ']';
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

function sortTable(table: HTMLTableElement, sortColumn) {
    let sortedRows = Array.from(table.rows)
        .slice(1)
        .sort((rowA, rowB) => rowA.cells[sortColumn].textContent > rowB.cells[sortColumn].textContent ? 1 : -1);
    table.rows[0].after(...sortedRows);
}

function centerXY(elem, container) {
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

function getCoords(elem) {
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

function positionAt(anchor, position, elem) {

}