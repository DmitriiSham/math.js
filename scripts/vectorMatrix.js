const mcName1 = "MATRIX"; // МК матрицы
const mcName2 = "Vector"; // МК ветором
const mcName3 = "Vector"; // МК приемник
const cubeLongId1 = 206000000002; // куб с матрицей
const cubeLongId2 = 207000000005; // куб с вектором
const cubeLongId3 = 207000000007; // куб с приемником

//=== READ DATA ===
const getMatrix = (mc, cube) => {
    const pivotData = om.multicubes
        .multicubesTab()
        .open(mc)
        .pivot()
        .addDependentContext(cube);
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
    return cells;
};
const cells = getMatrix(mcName1, cubeLongId1);
const cells2 = getMatrix(mcName2, cubeLongId2);

//=== USE SERVICE ===
const http = om.connectors.http();
const request = http.requestBuilder();
request
    .url()
    .setUrl(
        "https://am11.optimacros.com/app/8741c2d8-c2d7-4f9a-8dcc-281316bdda31/vectorMatrix"
    );
request
    .url()
    .params()
    .set("matrix", http.urlEncode(JSON.stringify(cells)));
request
    .url()
    .params()
    .set("matrix2", http.urlEncode(JSON.stringify(cells2)));
const response = request.send();

if (response.isOk()) {
    const data = response.getStringDataLikeJson();
    if (data.length) {
        const singleArray = data.flat();
        const pivot = om.multicubes
            .multicubesTab()
            .open(mcName2)
            .pivot()
            .addDependentContext(cubeLongId3);
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
