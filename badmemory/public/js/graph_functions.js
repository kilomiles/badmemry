$(function () {
    $('#pages_learned').highcharts({
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false
        },
        title: {
            text: 'Pages Learned'
        },
        tooltip: {
    	    pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
        },
        plotOptions: {
            data: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                    style: {
                        color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                    }
                }
            }
        },
        series: [{
            type: 'pie',
            name: 'Completion rate',
            data: [
                ['Not Learned',   info.pagesUnlearned],
                ['Completed',      info.pagesCompleted],
                {
                    name: 'In Progress',
                    y: info.pagesProgressing,
                    sliced: true,
                    selected: true
                }
            ]
        }]
    }); 
    $('#sentences_learned').highcharts({
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false
        },
        title: {
            text: 'Sentences Learned'
        },
        tooltip: {
    	    pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
        },
        plotOptions: {
            data: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                    style: {
                        color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                    }
                }
            }
        },
        series: [{
            type: 'pie',
            name: 'Completion rate',
            data: [
                ['Not Learned',   info.sentencesUnlearned],
                ['Completed',       info.sentencesCompleted],
                {
                    name: 'In Progress',
                    y: info.sentencesProgressing,
                    sliced: true,
                    selected: true
                }
            ]
        }]
    });  
});