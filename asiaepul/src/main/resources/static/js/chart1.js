$(document).ready(function() {
	$.ajax({
		url: "http://localhost:8000/board-chartData-mart",
		type: "GET",
		success: function(data) {
			const chart = echarts.init($("#verticalBarChart-mart")[0]);

			chart.setOption({
				title: {
					text: '지점별 실적'
				},
				tooltip: {
					trigger: 'axis',
					axisPointer: {
						type: 'shadow'
					}
				},
				legend: {},
				grid: {
					left: '3%',
					right: '4%',
					bottom: '3%',
					containLabel: true
				},
				xAxis: {
					type: 'value',
					boundaryGap: [0, 0.01],
					axisLabel: {
						formatter: function(value) {
							return value / 10000 + '만';
						}
					}
				},
				yAxis: {
					type: 'category',
					data: data.categories
				},
				series: data.series
			});
		},
		error: function(error) {
			console.error("데이터 가져오기 오류:", error);
		}
	});
});

/*document.addEventListener("DOMContentLoaded", async () => {
	const response = await fetch("http://localhost:8000/board-chartData-mart");
	const data = await response.json();
	const chart = echarts.init(document.querySelector("#verticalBarChart-mart"));

	chart.setOption({
		title: {
			text: '지점별 실적'
		},
		tooltip: {
			trigger: 'axis',
			axisPointer: {
				type: 'shadow'
			}
		},
		legend: {},
		grid: {
			left: '3%',
			right: '4%',
			bottom: '3%',
			containLabel: true
		},
		xAxis: {
			type: 'value',
			boundaryGap: [0, 0.01]
		},
		yAxis: {
			type: 'category',
			data: data.categories
		},
		series: data.series
	});
});*/