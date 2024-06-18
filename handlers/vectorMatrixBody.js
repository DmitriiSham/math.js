const math = require('./modules/math.js');

OM.web('vectorMatrixBody', async (request) => {
    const { matrix, matrix2 } = request.body || { matrix: [], matrix2: [] };
    // return JSON.stringify(matrix)
    try {
        const invertMatrix = math.inv(matrix)
        const matrixMultiply = math.multiply(invertMatrix, matrix2)
        return JSON.stringify(matrixMultiply);
    } catch (e) {
        return JSON.stringify([]);
    }
});