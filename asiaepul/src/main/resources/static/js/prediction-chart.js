document.addEventListener("DOMContentLoaded", async () => {
    const dom = document.getElementById('prediction-chart');
    const myChart = echarts.init(dom, null, {
        renderer: 'canvas',
        useDirtyRect: false,
        height: 260
    });
 
    
    async function drawChart() {
		// FastAPI 판매량 증감 추이 url
		const url = 'http://localhost:8000/prediction';
		
		const response = await fetch(url);
		const chartData = await response.json();
		console.log(chartData);

	    const series = [
	        {
	            "name": "실제 수요",
	            "type": "line",
	            "data": chartData.series[0].realData,
	            "color": '#2D68FE'
	        },
	        {
	            "name": "예측 수요",
	            "type": "line",
	            "data": chartData.series[1].predictedData,
	            "color": 'rgba(73, 211, 70, 0.6)'
	        }
	    ];
	
	    const option = {
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
	                dataView: { show: true, readOnly: true },
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
	                data: chartData.categories,
	                axisPointer: {
	                    type: 'shadow'
	                }
	            }
	        ],
	        yAxis: [
	            {
	                type: 'value',
	                name: '',
	                axisLabel: {
                    	margin: 10
                	}
	            }
	        ],
	        dataZoom: [
	            {
	              type: 'inside',
	              start: 0,
	              end: 10
	            },
	            {
	              start: 0,
	              end: 10
	            }
	        ],
	        series: series.map(s => ({
	            ...s,
	            tooltip: {
	                valueFormatter: function(value) {
	                return value + ' ea';  // 단위
	                }
	            },
	            symbol: 'none'
	        }))
	    };
	 
	    myChart.setOption(option);
	    
	    const dataSize = chartData.categories.length;
	    const startValue = Math.max(0, dataSize - 120); // 최근 10일을 보여주도록 설정, 데이터가 10개 미만인 경우는 처음부터 끝까지 보여줌
	    const endValue = dataSize - 1; // 마지막 인덱스
	
	    myChart.dispatchAction({
	        type: 'dataZoom',
	        startValue: startValue,
	        endValue: endValue
	    });
	    
	    window.addEventListener('resize', myChart.resize);
    }
    drawChart();
 
});