(function() {
    var matchApp = angular.module('matchApp', ['ngTouch', 'ui.grid', 'ngAnimate',
        'ui.grid.resizeColumns', 'ui.grid.selection',
        'ui.grid.exporter', 'ui.grid.pagination',
        'ui.grid.autoResize']);
    matchApp.controller('matchController', matchController);
    matchController.$inject = ['$scope', '$window', '$timeout',
                                'uiGridConstants', '$interval', '$element'];

    // for MathJax
//    matchApp.directive('mathJaxBind', function() {
//        var refresh = function(element) {
//            MathJax.Hub.Queue(["Typeset", MathJax.Hub, element]);
//        };
//        return {
//            link: function(scope, element, attrs) {
//                scope.$watch(attrs.mathJaxBind, function(newValue, oldValue) {
//                  element.text(newValue);
//                  refresh(element[0]);
//                });
//            }
//        };
//    });

    function matchController($scope, $window, $timeout, uiGridConstants, $interval, $element) {
        $scope.show_pre_info = true;
        $scope.pre_info = 'Please wait...';
        $scope.para = $window.para;
        $scope.results = $window.results;
        $scope.mz = $scope.para.mzRange.val;
        $scope.ccs = $scope.para.ccsRange.val;
        $scope.mzRange = $scope.para.mzRange.min.toFixed(4) + '~' + $scope.para.mzRange.max.toFixed(4);
        $scope.ccsRange = $scope.para.ccsRange.min.toFixed(4) + '~' + $scope.para.ccsRange.max.toFixed(4);
        $scope.mzTol = $scope.para.mzRange.real_tol.toString() ;
        $scope.ccsTol = $scope.para.ccsRange.real_tol;
        $scope.mzTolType = $scope.para.mzTolType;
        $scope.ccsTolType = $scope.para.ccsTolType;
        $scope.resultsLen = $scope.results.length;  // total data length

        // for formula
        $scope.expression1 = '$$ Delta \\ m/z = \\frac{ |Match \\ m/z - Adduct \\ m/z| }{ Adduct \\ m/z } \\times 10^6 $$';
        $scope.expression2 = '$$ Delta \\ CCS = \\frac{ |Match \\ CCS - Adduct \\ CCS| }{ Adduct \\ CCS } \\times 100 $$';

        $scope.ionMode = $scope.para.ionMode;
        if ($scope.ionMode == 'p') {
            $scope.ionMode = 'Positive';
        }
        else {
            $scope.ionMode = 'negative';
        }
        var showResult = function () {
            if ($scope.resultsLen != 0) {
                $scope.show_pre_info = false;
            } else {
                $scope.pre_info = 'There is no result, please try again.';
            }

        };

        // https://docs.angularjs.org/api/ng/service/$timeout, execute function after html done.
        $timeout(showResult);

        // ui-grid
        var colName = ['No.', 'HMDB ID', 'Name', 'm/z', 'CCS', 'Adduct', 'Delta m/z (ppm)', 'Delta CCS (%)'];
        var col_key = ['id', 'hmdb_id', 'name', 'mz', 'ccs', 'adduct_type', 'mz_delta', 'ccs_delta', 'link'];
        var defWidth = 80;
        var pageSize = 25;
        var hmdbTemp = '<div class="ui-grid-cell-contents"><a href="{{ row.entity.link }}" target="_blank">' +
            '{{ row.entity.hmdb_id }}</a></div>';

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
            exporterCsvFilename: 'match_results.csv',

            //pagination
            paginationPageSizes: [$scope.pageSize, $scope.pageSize*2, $scope.pageSize*3],
            paginationPageSize: paginationOptions.pageSize,

            //selection
            enableRowSelection: true,
            enableRowHeaderSelection: true,
            multiSelect: true,

            // column setting
            columnDefs: [
                {field: col_key[0], displayName: colName[0], width: defWidth - 30}, // id
                {field: col_key[1], displayName: colName[1], width: defWidth + 26, cellTemplate: hmdbTemp}, // HMDB ID
                {field: col_key[2], displayName: colName[2], width: defWidth + 135}, // name
                {field: col_key[5], displayName: colName[5], width: defWidth + 15},  // adduct_type
                {field: col_key[3], displayName: colName[3], width: defWidth}, // mz
                {field: col_key[4], displayName: colName[4], width: defWidth - 18}, // ccs
                {field: col_key[6], displayName: colName[6], width: defWidth + 20,  // mz_delta
                    sort: {
                        direction: uiGridConstants.ASC,
                        priority: 0,
                    }
                },
                {field: col_key[7], displayName: colName[7], width: defWidth + 30,  // ccs_delta
                    sort: {
                        direction: uiGridConstants.ASC,
                        priority: 1,
                    }
                },
            ],

        };
        // register API
        $scope.gridOptions.onRegisterApi = function (gridApi) {
                $scope.gridApi = gridApi;
                gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
                    paginationOptions.pageNumber = newPage;
                    paginationOptions.pageSize = pageSize;
                    $scope.pageSize = pageSize;
                    $scope.currentPage = newPage;
                    $scope.totalPage = Math.ceil($scope.gridOptions.totalItems/$scope.pageSize);

                });
        }
        // grid show data
        $scope.gridOptions.data = $scope.results;
        $scope.totalPage = Math.ceil($scope.resultsLen/$scope.pageSize);

        // for resize grid's height
//        $scope.tableHeight = 'height: 600px';

        function getTableHeight(totalPage, currentPage, pageSize, resultsLen) {
            var rowHeight = 30; // row height
            var headerHeight = 50; // header height
            var footerHeight = 60;  // bottom scroll bar height
            var totalH = 0;
            if (totalPage > 1) {
                // console.log('hehehehe');
                if (currentPage < totalPage) {
                    totalH = pageSize * rowHeight + headerHeight + footerHeight;
                }
                else {
                    var lastPageSize = resultsLen % pageSize;
                    // console.log(lastPageSize);
                    if (lastPageSize == 0) {
                        totalH = pageSize * rowHeight + headerHeight + footerHeight;
                    }
                    else {
                        totalH = lastPageSize * rowHeight + headerHeight + footerHeight;
                    }
                }
//                console.log(totalH);
            }
            else {
                totalH = resultsLen * rowHeight + headerHeight + footerHeight;
            }
            return 'height: ' + (totalH) + 'px';
        };
        // first time run, for quick load page
        $scope.tableHeight = getTableHeight($scope.totalPage,
                                            $scope.currentPage, $scope.pageSize,
                                            $scope.resultsLen);
        if ($scope.resultsLen != 0) {
            $interval(function() {
                $scope.tableHeight = getTableHeight($scope.totalPage,
                                                    $scope.currentPage, $scope.pageSize,
                                                    $scope.resultsLen);
                // console.log($scope.tableHeight);
                $scope.gridApi.grid.handleWindowResize();
                $scope.gridApi.core.refresh();
            }, 100);
        }
        // console.log($scope.tableHeight);
    }

})();