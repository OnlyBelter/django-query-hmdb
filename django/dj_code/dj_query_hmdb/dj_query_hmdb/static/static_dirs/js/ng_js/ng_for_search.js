(function() {
    let searchApp = angular.module('searchApp', ['ngTouch', 'ui.grid', 'ngAnimate',
        'ui.grid.resizeColumns', 'ui.grid.selection',
        'ui.grid.exporter', 'ui.grid.pagination',
        'ui.grid.autoResize']);
    searchApp.controller('searchController', searchController);
    searchController.$inject = ['$scope', '$window', '$timeout', '$interval'];
    function searchController($scope, $window, $timeout, $interval) {
        $scope.show_pre_info = true;
        $scope.pre_info = 'Please wait...';
        // following variables come from hmdb_result_search.html
        $scope.search_type = $window.search_field.field;
        $scope.search2query = $window.search2query;
        $scope.inputLen = $scope.search2query.length;  // total input length
        $scope.results = $window.results;
        $scope.resultsLen = $scope.results.length;  // total data length
        let showResult = function () {
            if ($scope.resultsLen !== 0) {
                $scope.show_pre_info = false;
                console.log($scope.results);
                console.log($scope.show_pre_info);
            } else {
                $scope.pre_info = 'There is no result, please try again.';
            }
        };
        $timeout(showResult);

        // ui-grid to show query result
        // name needs to show in html
        let colName = ['Query ID', 'HMDB ID', 'Chemical Formula',
                       'Exact Mass', 'SMILES', 'Super Class'];
        // name in database
        let col_key = ['id', 'accession', 'chemical_formula',
                       'monisotopic_molecular_weight',
                       'smiles', 'super_class'];
        let defWidth = 80;
        // row.entity determined by the columnDefs below, same as the elements in col_key
        // http://www.hmdb.ca/metabolites/HMDB0000022
        let hmdbTemp1 = '<div class="ui-grid-cell-contents">' +
            '<a href="http://www.hmdb.ca/metabolites/{{ row.entity.accession }}" target="_blank">' +
            '{{ row.entity.accession }}</a></div>';
        let formulaTemp2 = '<div ng-if="row.entity.chemical_formula" class="ui-grid-cell-contents">' +
            '{{row.entity.chemical_formula}}</div>' +
            '<div ng-if="!row.entity.chemical_formula" class="ui-grid-cell-contents">Null</div>';
        let massTemp3 = '<div ng-if="row.entity.monisotopic_molecular_weight" class="ui-grid-cell-contents">' +
            '{{row.entity.monisotopic_molecular_weight}}</div>' +
            '<div ng-if="!row.entity.monisotopic_molecular_weight" class="ui-grid-cell-contents">Null</div>';
        let smilesTemp4 = '<div ng-if="row.entity.smiles" class="ui-grid-cell-contents">' +
            '{{row.entity.smiles}}</div>' +
            '<div ng-if="!row.entity.smiles" class="ui-grid-cell-contents">Null</div>';
        let classTemp5 = '<div ng-if="row.entity.super_class" class="ui-grid-cell-contents">' +
            '{{row.entity.super_class}}</div>' +
            '<div ng-if="!row.entity.super_class" class="ui-grid-cell-contents">Null</div>';

        let paginationOptions = {
            pageNumber: 1,
            pageSize: 20,
        };

        $scope.currentPage = 1;
        $scope.pageSize = paginationOptions.pageSize;
        // https://github.com/angular-ui/ui-grid/wiki/Defining-columns
        $scope.gridOptions = {
            rowHeight: 30,
            enableSorting: true,
            enableGridMenu: true,  // for export
            enableSelectAll: true,
            // http://stackoverflow.com/questions/31531155/remove-export-to-pdf-option-in-angular-ui-grid/31531247
            exporterMenuPdf: false,  // disable pdf export
            exporterCsvFilename: 'search_results.csv',

            // pagination
            paginationPageSizes: [$scope.pageSize, $scope.pageSize*2, $scope.pageSize*3],
            paginationPageSize: paginationOptions.pageSize,

            // selection
            enableRowSelection: true,
            enableRowHeaderSelection: true,
            multiSelect: true,

            // column setting of query result
            columnDefs: [
                {field: col_key[0], displayName: colName[0], width: defWidth + 15}, // id
                {field: col_key[1], displayName: colName[1], width: defWidth + 60, cellTemplate: hmdbTemp1}, // HMDB ID
                {field: col_key[2], displayName: colName[2], width: defWidth + 40, cellTemplate: formulaTemp2},
                {field: col_key[3], displayName: colName[3], width: defWidth + 5, cellTemplate: massTemp3},
                {field: col_key[4], displayName: colName[4], width: defWidth + 110, cellTemplate: smilesTemp4},
                {field: col_key[5], displayName: colName[5], width: defWidth + 120, cellTemplate: classTemp5},
            ],
        };

        //===============================  grid for input parameters
        let queryIdTemplate = '<div ng-if="row.entity.id" class="ui-grid-cell-contents">{{row.entity.id}}</div>' +
            '<div ng-if="!row.entity.id" class="ui-grid-cell-contents">No Result</div>';
        let defWidthInput = 400;
        if ($scope.search_type !== 'HMDB_ID') {
            defWidthInput = 400;
        }

        let paginationOptionsInput = {
            pageNumber: 1,
            pageSize: 20,
        };

        $scope.currentPageInput = 1;
        $scope.pageSizeInput = paginationOptionsInput.pageSize;

        $scope.gridOptionsInput = {
            rowHeight: 30,
            enableSorting: true,
            enableGridMenu: true,  // for export
            enableSelectAll: true,
            // http://stackoverflow.com/questions/31531155/remove-export-to-pdf-option-in-angular-ui-grid/31531247
            exporterMenuPdf: false,  // disable pdf export
            exporterCsvFilename: 'search_input.csv',

            // pagination
            paginationPageSizes: [$scope.pageSize, $scope.pageSize*2, $scope.pageSize*3],
            paginationPageSize: paginationOptions.pageSize,

            // column setting of input
            columnDefs: [
                {field: 'value', displayName: $scope.search_type, width: defWidthInput, enableSorting: false}, // Input value
                {field: 'id', displayName: 'Query ID', width: 185, cellTemplate: queryIdTemplate}, // Query ID
            ],
        };
        // grid data
        $scope.gridOptionsInput.data = $scope.search2query;

        // for input para grid pagination
        $scope.gridOptionsInput.onRegisterApi = function (gridApi) {
        console.log('In API');
                $scope.gridApiInput = gridApi;
                gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
                    paginationOptions.pageNumber = newPage;
                    paginationOptions.pageSize = pageSize;
                    $scope.pageSizeInput = pageSize;
                    $scope.currentPageInput = newPage;
                });
        };
        $scope.totalPageInput = Math.ceil($scope.inputLen/$scope.pageSizeInput);
        $scope.tableHeightInput = 'height: 600px';
        let input_table_width = defWidthInput + 200;
        $scope.inputTableStyle = $scope.tableHeightInput + '; ' + 'width: ' + (input_table_width) + 'px';
        //=============================== grid for input parameters

        // register API
        $scope.gridOptions.onRegisterApi = function (gridApi) {
        console.log('In API');
                $scope.gridApi = gridApi;
                gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
                    paginationOptions.pageNumber = newPage;
                    paginationOptions.pageSize = pageSize;
                    $scope.pageSize = pageSize;
                    $scope.currentPage = newPage;
                });
        };
        // grid show data
        $scope.gridOptions.data = $scope.results;
        $scope.totalPage = Math.ceil($scope.resultsLen/$scope.pageSize);

        // for resize grid's height
//        $scope.tableHeight = 'height: 600px';

        function getTableHeight(totalPage, currentPage, pageSize, resultsLen, inputTable) {
            let headerHeight = 50;  // header height, result table has two lines in header
            if (inputTable) {
                headerHeight = 35  // input table has only one line in header
            }
            let rowHeight = 30; // row height

            let footerHeight = 60;  // bottom scroll bar height
            let totalH = 0;
            if (totalPage > 1) {
                // console.log('hehehehe');
                if (currentPage < totalPage) {
                    totalH = pageSize * rowHeight + headerHeight + footerHeight;
                }
                else {
                    let lastPageSize = resultsLen % pageSize;
                    // console.log(lastPageSize);
                    if (lastPageSize === 0) {
                        totalH = pageSize * rowHeight + headerHeight + footerHeight;
                    }
                    else {
                        totalH = lastPageSize * rowHeight + headerHeight + footerHeight;
                    }
                }
            }
            else {
                totalH = resultsLen * rowHeight + headerHeight + footerHeight;
            }
            return 'height: ' + (totalH) + 'px';
        }
        // first time run, for quick load page
        let inputTable=false;
        $scope.tableHeightInput = getTableHeight($scope.totalPageInput,
                                            $scope.currentPageInput, $scope.pageSizeInput,
                                            $scope.inputLen, inputTable=true);

        $scope.tableHeight = getTableHeight($scope.totalPage,
                                            $scope.currentPage, $scope.pageSize,
                                            $scope.resultsLen, inputTable=false);

        $interval(function() {
            $scope.tableHeight = getTableHeight($scope.totalPage,
                                                $scope.currentPage, $scope.pageSize,
                                                $scope.resultsLen, inputTable=false);
            $scope.tableHeightInput = getTableHeight($scope.totalPageInput,
                                                $scope.currentPageInput, $scope.pageSizeInput,
                                                $scope.inputLen, inputTable=true);
            $scope.inputTableStyle = $scope.tableHeightInput + '; ' + 'width: ' + (input_table_width) + 'px';
            console.log('result: ' + $scope.tableHeight);
            console.log('input: ' + $scope.tableHeightInput);
            if ($scope.resultsLen !== 0) {
                $scope.gridApi.grid.handleWindowResize();
                $scope.gridApi.core.refresh();
            }
            $scope.gridApiInput.grid.handleWindowResize();
            $scope.gridApiInput.core.refresh();
        }, 100);
    }

})();