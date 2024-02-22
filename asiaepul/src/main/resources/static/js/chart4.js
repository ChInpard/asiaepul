$(document).ready(function() {
	var dom = $('#waterfallchart').get(0);
	var myChart = echarts.init(dom, null, { renderer: 'canvas', useDirtyRect: false });

	$.get("http://localhost:8000/board-chartData-waterfall", function(data) {
		var legendData = data.series.map(function(item) {
			return item.name;
		});

		var option = {
			title: {
				text: '판매량 증감 추이'
			},
			tooltip: {
				trigger: 'axis',
				axisPointer: {
					type: 'shadow'
				},
				formatter: function(params) {
					let tar;
					if (params[1] && params[1].value !== '-') {
						tar = params[1];
					} else {
						tar = params[2];
					}
					return tar && tar.name + '<br/>' + tar.seriesName + ' : ' + tar.value;
				}
			},
			legend: {
				data: legendData
			},
			grid: {
				left: '3%',
				right: '4%',
				bottom: '3%',
				containLabel: true
			},
			xAxis: {
				type: 'category',
				data: data.categories
			},
			yAxis: {
				type: 'value'
			},
			series: data.series
		};

		myChart.setOption(option);
	});

	$(window).resize(function() {
		myChart.resize();
	});
});

/*document.addEventListener("DOMContentLoaded", function() {
	var dom = document.getElementById('waterfallchart');
	var myChart = echarts.init(dom, null, { renderer: 'canvas', useDirtyRect: false });

	fetch("http://localhost:8000/board-chartData-waterfall")
		.then(function(response) {
			return response.json();
		})
		.then(function(data) {
			var legendData = data.series.map(function(item) {
				return item.name;
			});

			var option = {
				title: {
					text: '판매량 증감 추이'
				},
				tooltip: {
					trigger: 'axis',
					axisPointer: {
						type: 'shadow'
					},
					formatter: function(params) {
						let tar;
						if (params[1] && params[1].value !== '-') {
							tar = params[1];
						} else {
							tar = params[2];
						}
						return tar && tar.name + '<br/>' + tar.seriesName + ' : ' + tar.value;
					}
				},
				legend: {
					data: legendData
				},
				grid: {
					left: '3%',
					right: '4%',
					bottom: '3%',
					containLabel: true
				},
				xAxis: {
					type: 'category',
					data: data.categories
				},
				yAxis: {
					type: 'value'
				},
				series: data.series
			};

			myChart.setOption(option);
		})
		.catch(function(error) {
			console.error('Error:', error);
		});

	window.addEventListener('resize', function() {
		myChart.resize();
	});
});*/