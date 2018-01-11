var DataTableVehicles = (function (dtv) {


    /**
     * Initial vehicle data
     * NOTE: The initial data could be placed in a separate .json file and loaded via an ajax request,
     * however when running this index via file: // instead of http: //, using the chrome there may be the "Cross-domain error" error.
     * There are ways to fix this bug, but it would be unnecessary for this teste
     */
    var json_initial_data = [
        {
            "placa": "FFF­5498",
            "marca": "Volkswagem",
            "modelo": "Gol",
            "cor": "Preto",
            "ano": 2014,
            "valor": "20.000,00",
            "novo": "Não",
            "imagem": null,
            "combustivel": "Flex",
            "descricao": "",
            "data_cadastro": "11/01/2018",
            "data_atualizacao": ""
        },
        {
            "placa": "PPT­6875",
            "marca": "Fiat",
            "modelo": "Uno",
            "cor": "Branco",
            "ano": 2018,
            "valor": "37.000,00",
            "novo": "Sim",
            "imagem": "https://precoscarros.com.br/wp-content/uploads/2017/02/Novo-Uno-2018-01.jpg",
            "combustivel": "Flex",
            "descricao": "O mais vendido",
            "data_cadastro": "11/01/2018",
            "data_atualizacao": ""
        }
    ];

    /**
     * Cache do dataTables
     */
    var dataTable = null;

    /**
     * Standard input of the checkbox type used in the vehicle table
     * @type {string}
     */
    var checkboxDataTable = '<input type="checkbox" class="data-tables-checkbox">';

    /**
     * Translation of some properties of data tables into Portuguese.
     */
    var dataTableI18n = {
        "sEmptyTable": "Nenhum veículo encontrado",
        "sInfo": "Mostrando de _START_ até _END_ de _TOTAL_ registros",
        "sInfoEmpty": "Mostrando 0 até 0 de 0 registros",
        "sInfoFiltered": "(Filtrados de _MAX_ registros)",
        "sInfoPostFix": "",
        "sInfoThousands": ".",
        "sLengthMenu": "_MENU_ resultados por página",
        "sLoadingRecords": "Carregando...",
        "sProcessing": '<i class="fa fa-cog fa-spin fa-3x"></i>',
        "sZeroRecords": "Nenhum veículo encontrado",
        "sSearch": "",
        "oPaginate": {
            "sNext": ">>",
            "sPrevious": "<<"
        },
        "oAria": {
            "sSortAscending": ": Ordenar colunas de forma ascendente",
            "sSortDescending": ": Ordenar colunas de forma descendente"
        }
    };

    /**
     * Initializes screen components: dataTable, CRUD actions of vehicles, modal, etc.
     */
    var initialize = function () {
        initializeDataTable();
        checkboxSelectAllVehicles();
        formAddVehicle();
        editVehicle();
        removeVehicle();
        manageModalEvents();
    };

    /**
     * When closing the modal with the vehicle form resets the form.
     */
    var manageModalEvents = function () {
        $('#modal-vehicle-form').on('hidden.bs.modal', function () {
            $(this).find('form').get(0).reset();
            $(this).find('input').removeAttr('disabled')
        })
    };

    /**
     * Removes the selected vehicles if the user confirms the deletion
     */
    var removeVehicle = function () {
        $('.btn-remove-vehicle').click(function () {
            swal({
                title: "Você tem certeza?",
                text: "Não será possível recuperar os dados deste veículo!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Sim, remova!",
                cancelButtonText: "Não, cancele por favor!",
                closeOnConfirm: false,
                closeOnCancel: false
            }, function (isConfirm) {
                if (isConfirm) {
                    $.each(selectedLines(), function (indice, lineVehicle) {
                        dataTable.row($(lineVehicle)).remove()
                    });
                    dataTable.draw();
                    saveVehicles();
                    $('#select-vehicles').prop('checked', false).trigger('change')
                    swal("Removido!", "Veículos removidos com sucesso.", "success");
                } else {
                    swal("Cancelado", "Seus dados estão Saved... por enquanto... :)", "error");
                }
                showDeleteVehicleButton();
            });
        })
    };


    var getDate = function() {
        var date = new Date(),
            year = date.getFullYear(),
            month = (date.getMonth() + 1).toString(),
            formatedMonth = (month.length === 1) ? ("0" + month) : month,
            day = date.getDate().toString(),
            formatedDay = (day.length === 1) ? ("0" + day) : day,
            hour = date.getHours().toString(),
            formatedHour = (hour.length === 1) ? ("0" + hour) : hour,
            minute = date.getMinutes().toString(),
            formatedMinute = (minute.length === 1) ? ("0" + minute) : minute,
            second = date.getSeconds().toString(),
            formatedSecond = (second.length === 1) ? ("0" + second) : second;
        return formatedDay + "/" + formatedMonth + "/" + year + " " + formatedHour + ':' + formatedMinute + ':' + formatedSecond;
    };

    /**
     * Save the vehicles in sessionStorage
     */
    var saveVehicles = function () {
        var vehicles = dataTable.rows().data();
        sessionStorage.setItem("vehicles", JSON.stringify(vehicles));
        swal("Parabéns!", "Veículo salvo com sucesso.", "success");
    };

    /**
     * Search all saved vehicles in sessionStorage
     */
    var listVehicles = function () {
        return JSON.parse(sessionStorage.getItem("vehicles"));
    };

    /**
     * Treat button display to exclude vehicles
     */
    var showDeleteVehicleButton = function () {
        if (selectedLines().length > 0) {
            $('.btn-remove-vehicle').show()
        } else {
            $('.btn-remove-vehicle').hide()
        }
    };

    /**
     * Add the vehicle according to the data defined in the modal
     * Check if there is already a license plate equal to the one being saved in order to only update the existing registry
     */
    var formAddVehicle = function () {
        $('#form-vehicle').submit(function () {
            var dataVehicle = {};
            $(this).find('.modal-body').find(':input').each(function (indice, input) {
                var $input = $(input);
                dataVehicle[$input.attr('name')] = $input.val();
            });
            var insercao = true;
            dataTable.rows().eq(0).filter(function (rowIdx) {
                if (dataTable.cell(rowIdx, 1).data() === dataVehicle['placa']) {
                    dataTable.cell(rowIdx, 2).data(dataVehicle['marca']);
                    dataTable.cell(rowIdx, 3).data(dataVehicle['modelo']);
                    dataTable.cell(rowIdx, 4).data(dataVehicle['cor']);
                    dataTable.cell(rowIdx, 5).data(dataVehicle['ano']);
                    dataTable.cell(rowIdx, 6).data(dataVehicle['valor']);
                    dataTable.cell(rowIdx, 7).data(dataVehicle['novo']);
                    dataTable.cell(rowIdx, 8).data(dataVehicle['imagem']);
                    dataTable.cell(rowIdx, 9).data(dataVehicle['combustivel']);
                    dataTable.cell(rowIdx, 10).data(dataVehicle['descricao']);
                    dataTable.cell(rowIdx, 11).data(dataVehicle['data_cadastro'] == null ? getDate : dataVehicle['data_cadastro']);
                    dataTable.cell(rowIdx, 12).data(dataVehicle['data_cadastro'] != null ? getDate : '');
                    insercao = false;
                }
            });
            if (insercao) {
                dataTable.row.add(dataVehicle).draw();
            } else {
                sessionStorage.removeItem('vehicles');
            }
            $('#modal-vehicle-form').modal('toggle');
            saveVehicles();
            return false;
        });
    };

    /**
     * Modal population with vehicle data for change
     * For this challenge, PLACA information was used as the registry ID, therefore,
     * this field can not be modified
     */
    var editVehicle = function () {
        $('#vehicles-table tbody tr td').livequery(function () {
            $(this).on('click', function (e) {
                var el = e.target;
                var openEditor = !((el.firstChild && el.firstChild.nodeValue == 'Imagem') || el.nodeName == 'INPUT');
                if (openEditor) {
                    var data = dataTable.row(this).data();
                    $('#modal-vehicle-form').modal('show');
                    $('#placa').val(data.placa).attr('disabled', 'disabled');
                    $('#imagem').val(data.imagem);
                    $('#marca').val(data.marca);
                    $('#modelo').val(data.modelo);
                    $('#valor').val(data.valor);
                    $('#ano').val(data.ano);
                    $('#cor').val(data.cor);
                    $('#novo').val(data.novo).trigger('change');
                    $('#descricao').val(data.descricao);
                    $('#combustivel').val(data.combustivel).trigger('change');
                    $('#data_cadastro').val(data.data_cadastro);
                    $('#data_atualizacao').val(getDate);

                }
            });
        });
    }

    /**
     * Treats the selection of vehicles in the table
     */
    var checkboxSelectAllVehicles = function () {
        $('#select-vehicles').click(function () {
            var table = $(this).closest('table');
            $('td input:checkbox', table).prop('checked', this.checked).trigger('change');
        });
    };

    /**
     * Returns all selected rows in the table
     */
    var selectedLines = function () {
        return $('#vehicles-table').find('tbody').find('input[type=checkbox]').filter(function () {
            return $(this).is(':checked');
        }).map(function (indice, checkbox) {
            return $(checkbox).closest('tr')
        })
    };

    /**
     * Checks whether an image exists or can be loaded
     * @param src Image URL
     * @param ok Callback which will be executed if the image exists
     * @param erro Callback which will be executed if the image does not exist
     */
    var imageVerify = function (src, ok, erro) {
        var img = new Image();
        img.onload = ok;
        img.onerror = erro;
        img.src = src;
    };

    /**
     * Function executed after dataTable is rendered
     * @param settings
     */
    var afterDrawDataTable = function (settings) {

        $('.data-tables-checkbox').livequery(function () {
            $(this).on('change', function () {
                if ($(this).is(':checked')) {
                    $(this).closest('tr').addClass('vehicle-select');
                } else {
                    $(this).closest('tr').removeClass('vehicle-select');
                }

                showDeleteVehicleButton();
            });

            $('.open-image').click(function (e) {
                e.preventDefault();

                var srcImage = $(this).attr('href');
                imageVerify(srcImage, function () {
                    $('#image-preview').attr('src', srcImage);
                    $('#image-modal').modal('show');
                }, function () {
                    //Uma imagem padrão para quando não achar a imagem no link informado
                    $('#image-preview').attr('src', 'images/404.jpg');
                    $('#image-modal').modal('show');
                });
            });
        })

    };

    /**
     * Create dataTable structure with startup parameters
     * @param vehicles
     */
    var applyDataTables = function (vehicles) {

        dataTable = $('#vehicles-table').DataTable({
            data: vehicles,
            aoColumns: [
                {
                    mData: null,
                    render: function (data, type, row) {
                        if (type === 'display') {
                            return checkboxDataTable;
                        }
                        return data;
                    },
                    className: "dt-body-center"
                },
                {mData: "placa"},
                {mData: "marca"},
                {mData: "modelo"},
                {mData: "cor"},
                {mData: "ano"},
                {mData: "novo"},
                {mData: "valor", className: "valor"},
                {mData: "imagem"},
                {mData: "combustivel"},
                {mData: "descricao"},
                {mData: "data_cadastro"},
                {mData: "data_atualizacao"}

            ],
            bLengthChange: false,
            bInfo: false,
            pageLength: 5,
            columnDefs: [
                {
                    orderable: false,
                    className: 'select-checkbox',
                    targets: 0
                },
                {
                    targets: 8,
                    mData: "imagem",
                    mRender: function (data, type, full) {
                        if (data) {
                            return '<a class="open-image" href="' + data + '">Imagem</a>';
                        } else {
                            return 'Sem Foto';
                        }
                    }
                }
            ],
            order: [[2, 'asc']],
            language: dataTableI18n,
            drawCallback: afterDrawDataTable
        });



        //input de pesquisa customizado
        var $inputFiltro = $('#vehicles-table_filter');
        $inputFiltro.html(


        '<div class="search input-group has-feedback width22 responsive-div">'+
        '<input type="search" class="form-control height4" aria-controls="vehicles-table" aria-describedby="search-group" placeholder="Pesquisar"/>'+
        '<span class="input-group-addon input-search-icon"><i class="glyphicon glyphicon-search" id="search-group"></i> </span>'

        );

        $inputFiltro.find('input').on('keyup', function (e) {
            dataTable.search(this.value).draw();
        });

        $inputFiltro.find('button').on('click', function (e) {
            dataTable.search($inputFiltro.find('input').value).draw();
        });
    };

    /**
     * Initializes the dataTable with the default data defined in the file
     */
    var initializeDataTable = function () {
        var vehiclesSaved = listVehicles();
        if (vehiclesSaved && vehiclesSaved.length > 0) {
          applyDataTables(vehiclesSaved);
        } else {
            //Whenever there is no data, the requested standard data will be loaded
          applyDataTables(json_initial_data);
        }
    };

    return {
      initialize: initialize
    }

}(DataTableVehicles));
$(document).ready(DataTableVehicles.initialize());