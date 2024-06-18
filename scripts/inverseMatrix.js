//=== READ DATA ===
const pivotData = om.multicubes
    .multicubesTab()
    .open("MATRIX")
    .pivot()
    .addDependentContext(206000000002);
const gridData = pivotData.create();
const generatorData = gridData.range().generator();
let cells = [];
for (const chunk of generatorData) {
    chunk
        .rows()
        .all()
        .forEach((label) => {
            const cellsGrid = label.cells().all();
            const cellsRow = cellsGrid.map((cell) => cell.getValue());
            cells.push(cellsRow);
        });
}

//=== USE SERVICE ===
const http = om.connectors.http();
const request = http.requestBuilder();
request
    .url()
    .setUrl(
        "https://am11.optimacros.com/app/8741c2d8-c2d7-4f9a-8dcc-281316bdda31/invert"
    );
request
    .url()
    .params()
    .set("matrix", http.urlEncode(JSON.stringify(cells)));
const response = request.send();

if (response.isOk()) {
    const data = response.getStringDataLikeJson();
    if (data.length) {
        const singleArray = data.flat();
        const pivot = om.multicubes
            .multicubesTab()
            .open("MATRIX")
            .pivot()
            .addDependentContext(206000000003);
        const grid = pivot.create();
        const generator = grid.range().generator();
        const cb = om.common.createCellBuffer().canLoadCellsValues(false);
        for (const chunk of generator) {
            chunk
                .cells()
                .all()
                .forEach((label, index) => {
                    cb.set(label, Number(singleArray[index]) || "");
                });
        }
        cb.apply();
    }
    console.log("Done!");
} else {
    console.log("Service Error!");
}
