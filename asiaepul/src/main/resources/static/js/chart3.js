$(document).ready(function() {
	const dom = $('#lineChart-analysis').get(0);
	const myChart = echarts.init(dom, null, {
		renderer: 'canvas',
		useDirtyRect: false
	});

	$.ajax({
		url: "http://localhost:8000/board-chartData-analysis",
		method: "GET",
		success: function(data) {
			const { categories, series } = data;

			const option = {
				title: {
					text: '수요예측'
				},
				tooltip: {
					trigger: 'axis',
					axisPointer: {
						type: 'cross',
						crossStyle: {
							color: '#999'
						}
					}   
				},
				toolbox: {
					feature: {
						dataView: { show: true, readOnly: false },
						magicType: { show: true, type: ['line', 'bar'] },
						restore: { show: true },
						saveAsImage: { show: true }
					}
				},
				legend: {
					data: series.map(s => s.name) // 동적으로 범례 데이터 설정
				},
				xAxis: [
					{
						type: 'category',
						data: categories,
						axisPointer: {
							type: 'shadow'
						}
					}
				],
				yAxis: [
					{
						type: 'value',
						name: '',
					}
				],
				series: series.map(s => ({
					...s,
					tooltip: {
						valueFormatter: function(value) {
							return value + ' box'; // 단위
						}
					}
				}))
			};

			myChart.setOption(option);
			$(window).on('resize', function() {
				myChart.resize();
			});

			myChart.getZr().on('click', function(event) {
				if (!event.target) {
					window.location.href = '/prediction';
				}
			});
		},
		error: function(jqXHR, textStatus, errorThrown) {
			console.error("Error fetching chart data: ", errorThrown);
		}
	});
});

/*document.addEventListener("DOMContentLoaded", async () => {
	const dom = document.getElementById('lineChart-analysis');
	const myChart = echarts.init(dom, null, {
		renderer: 'canvas',
		useDirtyRect: false
	});

	try {
		const response = await fetch("http://localhost:8000/board-chartData-analysis");
		if (!response.ok) throw new Error('Data fetch failed');
		const { categories, series } = await response.json();

		const option = {
			title: {
				text: '수요예측'
			},
			tooltip: {
				trigger: 'axis',
				axisPointer: {
					type: 'cross',
					crossStyle: {
						color: '#999'
					}
				}
			},
			toolbox: {
				feature: {
					dataView: { show: true, readOnly: false },
					magicType: { show: true, type: ['line', 'bar'] },
					restore: { show: true },
					saveAsImage: { show: true }
				}
			},
			legend: {
				data: series.map(s => s.name)  // 동적으로 범례 데이터 설정
			},
			xAxis: [
				{
					type: 'category',
					data: categories,
					axisPointer: {
						type: 'shadow'
					}
				}
			],
			yAxis: [
				{
					type: 'value',
					name: '',
				}
			],
			series: series.map(s => ({
				...s,
				tooltip: {
					valueFormatter: function(value) {
						return value + ' box';  // 단위
					}
				}
			}))
		};

		myChart.setOption(option);
		window.addEventListener('resize', myChart.resize);

		myChart.getZr().on('click', function(event) {
			// 클릭 위치에 시리즈 데이터가 없으면 페이지 이동
			if (!event.target) {
				window.location.href = '/result2';
			}
		});
	} catch (error) {
		console.error("Error fetching chart data: ", error);
	}
});*/