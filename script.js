'use strict';

let div = document.createElement('div');
div.className = "section";
div.id = "html-inserted";
div.textContent = "hello world\n";

document.querySelector('section').prepend(div);

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
        ul.append(li);
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
            item.firstChild.data += '[' + nChildren + ']'
        }
    }
}

annotateListItems();

function sortTable(table, sortColumn) {
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
