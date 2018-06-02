
window.addEventListener("load", () => {
    const { fromEvent, combine } = most;

    function toNumber(event) {
        console.log(event.target.value);
        return Number(event.target.value)
    }
    function validMatrix(m) {
        return m.length === 6 && m.filter(elem => typeof (elem) !== "number").length === 0;
    }
    function applyTransform(p, m) {
        var xt = p[0] * m[0] + p[1] * m[2] + m[4];
        var yt = p[0] * m[1] + p[1] * m[3] + m[5];
        return [xt, yt];
    }
    function transform(m1, m2) {
        return [
            m1[0] * m2[0] + m1[2] * m2[1],
            m1[1] * m2[0] + m1[3] * m2[1],
            m1[0] * m2[2] + m1[2] * m2[3],
            m1[1] * m2[2] + m1[3] * m2[3],
            m1[0] * m2[4] + m1[2] * m2[5] + m1[4],
            m1[1] * m2[4] + m1[3] * m2[5] + m1[5]
        ];
    };

    const IDENTITY_MATRIX = [1, 0, 0, 1, 0, 0];

    function toMatrix(event) {
        return String(event.target.value).split(" ").filter(x => x !== "").map(Number);
    }

    function matrixStreamOf(input) {
        return fromEvent("input", input).map(toMatrix).startWith(IDENTITY_MATRIX);
    }

    function numberStreamOf(input) {
        return fromEvent("input", input).map(toNumber).startWith(0);
    }

    // point x matrix
    const matrix$ = matrixStreamOf(document.getElementById("matrix-1"));
    const x$ = numberStreamOf(document.getElementById("x"));
    const y$ = numberStreamOf(document.getElementById("y"));
    const point$ = combine((a, b) => [a, b], x$, y$);
    const out1$ = combine(applyTransform, point$, matrix$);
    const out1 = document.getElementById("out-1");
    out1$.map(p => p.join(" ")).observe(p => out1.textContent = p);

    // matrix x matrix
    const matrixMul1$ = matrixStreamOf(document.getElementById("matrix-mul-1"));
    const matrixMul2$ = matrixStreamOf(document.getElementById("matrix-mul-2"));
    const outMul = document.getElementById("out-mul");
    const outMul$ = combine(transform, matrixMul1$, matrixMul2$);
    outMul$.map(p => p.join(" ")).observe(m => outMul.textContent = m);
});