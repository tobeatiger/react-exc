'use strict';

var React = require('react');
var ReactDOM = require('react-dom');

// Follow below commands to build the minified bundle.js
// $ cd your_directory
// $ babel fuliye.js --out-file tmp.js --presets C:/Users/samsung/AppData/Roaming/npm/node_modules/babel-preset-react
// $ browserify tmp.js | uglifyjs > bundle.js
// or run build.bat

var seriesDefault = [
    {id:1,stroke:'black',strokeWidth:2,theeter:1,margin:4/Math.PI,checked:true,title:'4Sin(x)/PI'},
    {id:2,stroke:'red',strokeWidth:2,theeter:3,margin:4/(3*Math.PI),checked:true,title:'4Sin(x)/3PI'},
    {id:3,stroke:'blue',strokeWidth:2,theeter:5,margin:4/(5*Math.PI),checked:true,title:'4Sin(x)/5PI'},
    {id:4,stroke:'darkgoldenrod',strokeWidth:2,theeter:7,margin:4/(7*Math.PI),checked:true,title:'4Sin(x)/7PI'},
    {id:5,stroke:'darkred',strokeWidth:2,theeter:9,margin:4/(9*Math.PI),checked:true,title:'4Sin(x)/9PI'},
    {id:6,stroke:'#666',strokeWidth:2,theeter:11,margin:4/(11*Math.PI),checked:true,title:'4Sin(x)/11PI'},
];

var data = {
    config: {
        yOfOne: 38,
        totalWidth: 1050,
        minTotalHeight: 50,
        sumTotalHeight: 100,
        sumStroke: 'green',
        sumStrokeWidth: 2,
        timePerRound: 2000
    },
    series: $.extend(true, [], seriesDefault)
};

var MyFuliye = React.createClass({
    getInitialState: function () {
        return {initTime: new Date().getTime(), currentTime: new Date().getTime(), showFirst6Only: false};
    },
    componentDidMount: function() {
        var h = setInterval(function () {
            this.setState({currentTime:new Date().getTime()});
        }.bind(this), 50);
        $(this.refs.root).find('.stop').click(function(){
            clearInterval(h);
        });
        $(this.refs.root).find('.resume').click(function(){
            clearInterval(h);
            h = setInterval(function () {
                var t = new Date().getTime();
                if(t - this.state.initTime <= 0 || t - this.state.initTime > 18000) {
                    this.setState({currentTime:t,initTime:t});
                } else {
                    this.setState({currentTime:t});
                }
            }.bind(this), 50);
        }.bind(this));
        $(this.refs.root).find('.reset').click(function(){
            this.props.settings.series = $.extend(true, [], seriesDefault);
            $(this.refs.root).find('.resume').click();
        }.bind(this));
        $(this.refs.root).find('.add').click(function(){
            var latestN = this.props.settings.series[this.props.settings.series.length-1].id + 1;
            var next = {
                id: latestN,
                stroke: '#666',
                strokeWidth: 1,
                theeter: 2*latestN-1,
                margin: 4/((2*latestN-1)*Math.PI),
                checked: true,
                title: '4Sin(' + (2*latestN-1) + 'x)/' + (2*latestN-1) + 'PI'
            };
            this.props.settings.series = this.props.settings.series.concat(next);
        }.bind(this));
        $(this.refs.root).find('.showOrHide').click(function(){
            this.setState({showFirst6Only:!this.state.showFirst6Only});
        }.bind(this));
    },
    getSinPoints: function (item) {
        var roundTripX = this.props.settings.config.totalWidth / 7;
        var yOfOne = this.props.settings.config.yOfOne;
        var totalHeight = yOfOne * item.margin * 2 + 8;
        if(totalHeight < this.props.settings.config.minTotalHeight) {
            totalHeight = this.props.settings.config.minTotalHeight;
        }
        var panning = totalHeight / 2;

        var points = '';
        var timePerRound = this.props.settings.config.timePerRound; //mini seconds
        var maxI = (roundTripX * ((this.state.currentTime - this.state.initTime) / timePerRound)).toFixed(0);
        for(var i=0;i<maxI;i++) {
            points = points + i + ',' +
                (-1 * yOfOne * item.margin * Math.sin(item.theeter*2*Math.PI*i/roundTripX) + panning).toFixed(0) + ' ';
            if(i > this.props.settings.config.totalWidth) {
                setTimeout(function() {
                    this.setState({currentTime:new Date().getTime(),initTime:new Date().getTime()});
                }.bind(this), 5);
                break;
            }
        }
        return points;
    },
    sum: function () {
        var series = this.props.settings.series;
        var config = this.props.settings.config;
        var totalHeight = config.sumTotalHeight;
        var yOfOne = config.yOfOne;
        var x = '0,' + totalHeight/2 + ' ' + config.totalWidth + ',' + totalHeight/2;
        var y = '0,0 0,' + totalHeight;

        var points = '';
        var timePerRound = config.timePerRound;
        var roundTripX = config.totalWidth/7;
        var maxI = (roundTripX * ((this.state.currentTime - this.state.initTime) / timePerRound)).toFixed(0);
        var panning = totalHeight / 2;

        function getSumY (x, series) {
            var y = 0;
            $.each(series, function (index, item) {
                if(item.checked) {
                    y += -1 * yOfOne * item.margin * Math.sin(item.theeter*2*Math.PI*x/roundTripX);
                }
            });
            return y;
        }
        var tmpSumY = 0;
        for(var i=0;i<maxI;i++) {
            tmpSumY = getSumY(i, series);
            if(Math.abs(tmpSumY) * 2 + 8 > config.sumTotalHeight) {
                config.sumTotalHeight = Math.abs(tmpSumY) * 2 + 8;
            }
            points = points + i + ',' + (tmpSumY+panning).toFixed(0) + ' ';
        }

        return <div className="aSeries">
            <label className="seriesTitle" style={{position:'relative',top:-(totalHeight/2-3)+'px',fontWeight:'bold',color:config.sumStroke}}>
                Combined:
            </label>
            <svg width={config.totalWidth} height={totalHeight}>
                <polyline points={points} style={{fill:'none',stroke:config.sumStroke,strokeWidth:config.sumStrokeWidth}} />
                <polyline points={x} style={{fill:'none',stroke:'black',strokeWidth:1}} />
                <polyline points={y} style={{fill:'none',stroke:'black',strokeWidth:1}} />
            </svg>
        </div>;
    },
    onFilter: function (item) {
        item.checked = !item.checked;
        return true;
    },
    onXChange: function (item, e) {
        try {
            item.theeter = parseFloat($(e.target).val());
            item.title = 'Customized';
        } catch (err) {
            console.log(err);
        }
    },
    onMarginChange: function (item, e) {
        try {
            item.margin = parseFloat($(e.target).val());
            item.title = 'Customized';
        } catch (err) {
            console.log(err);
        }
    },
    render: function() {
        var timeCollapse = ((this.state.currentTime - this.state.initTime) / 1000).toFixed(2);
        var controlArea = <div className="controlArea">
            <label>Time collapse (in <strong>seconds</strong>, and restarted again when finished the painting): </label>
            <span className="showTime">{timeCollapse}</span>
            <div className="buttons">
                <input type="button" value="Stop" className="stop"/>
                <input type="button" value="Resume" className="resume"/>
                <input type="button" value="Reset" className="reset"/>
                <input type="button" value="Add" className="add"/>
                <input type="button" value="Show/Hide details" className="showOrHide"/>
            </div>
        </div>;

        var series = this.props.settings.series.map(function (item, i) {
            if(this.state.showFirst6Only && i > 5) {
                return '';
            }
            var totalHeight = this.props.settings.config.yOfOne * item.margin * 2 + 8;
            if(totalHeight < this.props.settings.config.minTotalHeight) {
                totalHeight = this.props.settings.config.minTotalHeight;
            }
            var x = '0,' + totalHeight/2 + ' ' + this.props.settings.config.totalWidth + ',' + totalHeight/2;
            var y = '0,0 0,' + totalHeight;
            var points = this.getSinPoints(item);
            return (
                <div key={item.id} className="aSeries">
                    <label className="seriesTitle" style={{position:'relative',top:-(totalHeight/2-15)+'px',fontWeight:'bold',color:item.stroke}}>
                        <div>
                            {item.title}:<input type="checkbox" checked={item.checked} onChange={this.onFilter.bind(null,item)} />
                        </div>
                        <div>
                            x:<input type="text" value={item.theeter} style={{width:'18px'}} onChange={this.onXChange.bind(null,item)} />
                            {' '}
                            margin:<input type="text" value={item.margin} style={{width:'40px'}} onChange={this.onMarginChange.bind(null,item)} />
                        </div>
                    </label>
                    <svg width={this.props.settings.config.totalWidth} height={totalHeight}>
                        <polyline points={points} style={{fill:'none',stroke:item.stroke,strokeWidth:item.strokeWidth}} />
                        <polyline points={x} style={{fill:'none',stroke:'black',strokeWidth:1}} />
                        <polyline points={y} style={{fill:'none',stroke:'black',strokeWidth:1}} />
                    </svg>
                </div>
            );
        }.bind(this));

        var sum = this.sum();

        return (
            <div className="myFuliye" ref="root">
                {controlArea}
                <div className="mainBlock">
                    {series}
                    {sum}
                </div>
            </div>
        );
    }
});

ReactDOM.render(<MyFuliye settings={data}/>, $('#container')[0]);