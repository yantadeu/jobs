describe("ProjetasVehicles", function () {
    var projetas;
    var input = [
        {
            field: 'placa',
            required: true,
            value: 'PPSAD-3899'
        },
        {
            field: 'marca',
            required: true,
            value: 'Fiat'
        },
        {
            field: 'modelo',
            required: true,
            value: 'Strada'
        },
        {
            field: 'cor',
            required: true,
            value: 'Azul'
        },
        {
            field: 'ano',
            required: true,
            value: '2016'
        },
        {
            field: 'valor',
            required: true,
            value: '30.000,00'
        },
        {
            field: 'imagem',
            required: false,
            value: ''
        },
        {
            field: 'combustivel',
            required: false,
            value: ''
        },
        {
            field: 'data_cadastro',
            required: true,
            value: '12/01/2018'
        },
        {
            field: 'data_atualizacao',
            required: false,
            value: '12/01/2018'
        },
        {
            field: 'novo',
            required: true,
            value: 'Sim'
        },
        {
            field: 'Descrição',
            required: false,
            value: ''
        }
    ];

    beforeEach(function () {
        projetas = new Projetas();
    });

    it("should show result value of required erros equal to 0 for the required attributes for " + JSON.stringify(input), function () {
        var result = projetas.solve(input);
        expect(result).toEqual(0);
    });
});
