const math = require('./modules/math.js');

OM.web('vectorMatrix', async (request) => {
    // return JSON.stringify(math.inv([[1, 2, 4], [1, 4, 2], [0, 2, 1]]));
    const { query } = request;
    const { matrix, matrix2 } = query || { matrix: '%5B%5D', matrix2: '%5B%5D' };

    try {
        const matrix1parse = JSON.parse(decodeURIComponent(matrix));
        const matrix2parse = JSON.parse(decodeURIComponent(matrix2));
        const invertMatrix = math.inv(matrix1parse)
        const matrixMultiply = math.multiply(invertMatrix, matrix2parse)
        return JSON.stringify(matrixMultiply);
    } catch (e) {
        return JSON.stringify([]);
    }
});