(function() {
    var predictApp = angular.module('predictApp', ['ngTouch', 'ui.grid', 'ngAnimate',
        'ui.grid.resizeColumns', 'ui.grid.selection',
        'ui.grid.exporter', 'ui.grid.pagination',
        'ui.grid.autoResize']);
    predictApp.controller('predictController', predictController);
    predictController.$inject = ['$scope', '$window', '$timeout', '$interval'];
    function predictController($scope, $window, $timeout, $interval) {
        $scope.show_pre_info = true;
        $scope.pre_info = 'Please wait...';
        $scope.para = $window.para;
        $scope.errors = $window.errors;
        $scope.results = $window.results;
        $scope.resultsLen = $scope.results.length;  // total data length
        var showResult = function () {
            if ($scope.results.length != 0) {
                $scope.show_pre_info = false;
                console.log($scope.results);
                console.log($scope.show_pre_info);
            } else {
                $scope.pre_info = 'There is no result, please try again.';
            }
        }

        $timeout(showResult);

        // ui-grid
        var colName = ['No.', 'Name', 'Exact Mass', 'CCS  [M+H]', 'CCS  [M+Na]',
            'CCS          [M-H2O+H]', 'CCS  [M-H]', 'CCS      [M+Na-2H]', 'Status'];
//        var colName = ['Query ID', 'Name', 'Exact Mass', 'CCS  [M+H]', 'CCS  [M+Na]',
//            'CCS          [M-H2O+H]', 'CCS  [M-H]', 'CCS      [M+Na-2H]', 'Status', 'HMDB ID    ', 'Delta'];
        var col_key = ['id', 'name', 'acc_mass', 'm_h_plus', 'm_na', 'm_h_h2o',
            'm_h_minus', 'm_na_2h', 'status'];
        var defWidth = 80;
        var m_h_plusTemplate = '<div ng-if="row.entity.m_h_plus" class="ui-grid-cell-contents">{{row.entity.m_h_plus}}</div>' +
            '<div ng-if="!row.entity.m_h_plus" class="ui-grid-cell-contents">Null</div>';
        var m_naTemplate = '<div ng-if="row.entity.m_na" class="ui-grid-cell-contents">{{row.entity.m_na}}</div>' +
            '<div ng-if="!row.entity.m_na" class="ui-grid-cell-contents">Null</div>';
        var m_h_h2oTemplate = '<div ng-if="row.entity.m_h_h2o" class="ui-grid-cell-contents">{{row.entity.m_h_h2o}}</div>' +
            '<div ng-if="!row.entity.m_h_h2o" class="ui-grid-cell-contents">Null</div>';
        var m_h_minusTemplate = '<div ng-if="row.entity.m_h_minus" class="ui-grid-cell-contents">{{row.entity.m_h_minus}}</div>' +
            '<div ng-if="!row.entity.m_h_minus" class="ui-grid-cell-contents">Null</div>';
        var m_na_2hTemplate = '<div ng-if="row.entity.m_na_2h" class="ui-grid-cell-contents">{{row.entity.m_na_2h}}</div>' +
            '<div ng-if="!row.entity.m_na_2h" class="ui-grid-cell-contents">Null</div>';

        var paginationOptions = {
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
            exporterCsvFilename: 'predict_results.csv',

            // pagination
            paginationPageSizes: [$scope.pageSize, $scope.pageSize*2, $scope.pageSize*3],
            paginationPageSize: paginationOptions.pageSize,

            // selection
            enableRowSelection: true,
            enableRowHeaderSelection: true,
            multiSelect: true,

            // column setting
            columnDefs: [
                {field: col_key[0], displayName: colName[0], width: defWidth - 30}, // id
                {field: col_key[1], displayName: colName[1], width: defWidth + 80}, // name
                {field: col_key[2], displayName: colName[2], width: defWidth + 35}, // mass
                {field: col_key[3], displayName: colName[3], width: defWidth - 18, cellTemplate: m_h_plusTemplate},
                {field: col_key[4], displayName: colName[4], width: defWidth - 5, cellTemplate: m_naTemplate},
                {field: col_key[5], displayName: colName[5], width: defWidth + 20, cellTemplate: m_h_h2oTemplate},
                {field: col_key[6], displayName: colName[6], width: defWidth - 18, cellTemplate: m_h_minusTemplate},
                {field: col_key[7], displayName: colName[7], width: defWidth + 20, cellTemplate: m_na_2hTemplate},
                {field: col_key[8], displayName: colName[8], width: defWidth + 20},  // status
            ],

        };
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
        }
        // grid show data
        $scope.gridOptions.data = $scope.results;
        $scope.totalPage = Math.ceil($scope.resultsLen/$scope.pageSize);

        // for resize grid's height
        $scope.tableHeight = 'height: 600px';

        function getTableHeight(totalPage, currentPage, pageSize, resultsLen) {
            var rowHeight = 30; // row height
            var headerHeight = 50; // header height
            var footerHeight = 60;  // bottom scroll bar height
            var totalH = 0;
            if (totalPage > 1) {
                if (currentPage < totalPage) {
                    totalH = pageSize * rowHeight + headerHeight + footerHeight;
                }
                else {
                    var lastPageSize = resultsLen % pageSize;
                    if (lastPageSize == 0) {
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
        };
        $scope.tableHeight = getTableHeight($scope.totalPage,
                                            $scope.currentPage, $scope.pageSize,
                                            $scope.resultsLen);
        console.log($scope.tableHeight);
    }

})();