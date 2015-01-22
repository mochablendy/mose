/* vim:set ts=4 sw=4: */
var mose = mose || {};
(function(app) {
    var setupSheet;
    var opt_graph;

    app.initSetupSheet = function(selector) {
        setupSheet = $(selector).DataTable({
            "columns": [{
                "title": "Category"
            },
            {
                "title": "Section"
            },
            {
                "title": "Component"
            }]
        });
    };

    app.show = function(formData, viewModel) {
        $.ajax({
            type: 'POST',
            contentType: false,
            processData: false,
            data: formData,
            dataType: 'json',
            cache: false,
            async: false,
            url: '/analyze',
            success: function(json) {
                if ('error' in json) {
                    viewModel.message(json.error.message);
                    alert(json.error.message);
                } else {
					/* First, update the setup sheet. */
					updateSetupSheet(json.data.sheetdata);
					/* Second, update graphs. */
					updateGraphs(json.data.graphhtml);
				}
            }
        });

        /*
        $('#analysis-tab a[href="#tab-analysis"]').tab('show');
		*/
    };

    app.viewModel = function() {
        var self = this;

        self.message = ko.observable('');

        self.file = ko.observableArray([{
            name: ''
        },
        {
            name: ''
        }]);

        self.addFile = function() {
            self.file.push({
                name: "New at " + new Date()
            });
        };

        self.removeFile = function() {
            self.file.remove(this);
        }
    }

    function updateSetupSheet(sheetdata) {
        var id = $(setupSheet.table().node()).attr('id');
        setupSheet.destroy();
        $('#' + id).empty();

        /* The first row in sheetdata is a column header */
        var columnHeader = sheetdata.shift().map(function(column_name) {
            return {
                "title": column_name.replace('<', '&lt').replace('>', '&gt')
            };
        });
        setupSheet = $('#' + id).DataTable({
            "processing": true,
            "paging": false,
            "columns": columnHeader,
            "data": sheetdata,
			"createdRow": function(row, data, dataIndex) {
				var isSame = data.slice(3).every(function(elem) {
					return (elem === data[3]);
				});
				if (!isSame) {
					$(row).addClass('danger');
				}
			}
        });
		/* Initialize FixedHeader */
		new $.fn.dataTable.FixedHeader(setupSheet);

		/* Initialize TableTools */
		var tt = new $.fn.dataTable.TableTools(setupSheet);
		$( tt.fnContainer() ).insertBefore('div.dataTables_wrapper');
    }

	function updateGraphs(graphhtml) {
		$('#tab-analysis').replaceWith(graphhtml);
	}

})(mose);
