$(document).ready(function() {
	$.ajax({
		url: "http://localhost:8000/board-chartData-sell",
		method: "GET",
		success: function(data) {
			const chart = echarts.init($("#verticalBarChart-sell").get(0));

			chart.setOption({
				title: {
					text: '판매량 분석 시트'
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
		},
		error: function(xhr, status, error) {
			console.error("Error fetching data:", error);
		}
	});
});

/*document.addEventListener("DOMContentLoaded", async () => {
	const response = await fetch("http://localhost:8000/board-chartData-sell");
	const data = await response.json();
	const chart = echarts.init(document.querySelector("#verticalBarChart-sell"));

	chart.setOption({
		title: {
			text: '판매량 분석 시트'
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