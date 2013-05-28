SHIVA_Show.prototype.DrawWordCloud = function() {
    //Helper Functions
    //extract Object attrs from an array of Objects
    Array.prototype.extract = function(attr) {
        var res = [];
        for (var i = 0; i < this.length; i++) {
            res.push(this[i][attr]);
        }
        return res;
    }
    //find the difference between an array and an array of Objects
    Array.prototype.diff = function(arr) {
        return this.filter(function(val) {
            return arr.indexOf(val.text) == -1;
        });
    }
    //retrieve an array item
    Array.prototype.find = function(item, attr) {
        for (var i = 0; i < this.length; i++) {
            if (this[i][attr] == item)
                return this[i];
        }
        return false;
    }
    var cloud;
    var fill = d3.scale.category20();
    //Routing to prevent unecessary redraws
    if (!this.wcloud) {
        cloud = new wordCloud(this.container);
        this.wcloud = cloud;
        cloud.options = this.options;
        cloud.load(this.options.dataSourceUrl);
    } else {
        cloud = this.wcloud;
        var props = Object.keys(this.options);
        for (var i = 0; i < props.length; i++) {
            var prop = props[i];
            if (this.wcloud.options[prop] != this.options[prop]) {
                if (prop == "dataSourceUrl") {
                    cloud.options = this.options;
                    cloud.load(cloud.options['dataSourceUrl']);
                    break;
                } else if (prop == "width" || prop == "height" || prop == "low_threshold" || prop == "high_threshold" || prop == 'tiltRange' || prop == "scale") {
                    cloud.options = this.options;
                    cloud.buildLayout(cloud.d);
                } else {
                    switch (prop) {
                        case 'font_name':
                            d3.selectAll('text').style('font-family', this.options.font_name);
                            break;
                        case 'backgroundColor':
                            d3.select('rect').style('fill', '#' + this.options.backgroundColor);
                            break;
                        case 'spectrum':
                            cloud.colorize(this.options.spectrum);
                            break;
                        case 'title':
                            d3.select('#cloudTitle').text(this.options.title);
                            break;
                        case 'titleColor':
                            d3.select('#cloudTitle').attr('fill', '#' + this.options.titleColor);
                            break;
                        case 'titleFontSize':
                            d3.select('#cloudTitle').style('font-size', this.options.titleFontSize + 'px');
                            break;
                        case 'wordList':
                            if (this.options.wordList == "true")
                                $('#cloudShowListButton').show();
                            else {
                                $('#cloudShowListButton').hide();
                                $('#wordCloudWordList').hide();
                            }
                            break;
                    }
                }
            }
        }
        cloud.options = this.options;
    }
    function wordCloud(container) {
        this.d = [];
        this.filterSet = [];
        this.container = container;
        this.draw = function(data) {
            var word = data;
            $('svg').remove();
            $('#cloudLoad').remove();
            d3.select("#" + cloud.container).append("svg").attr("id", "wordCloud").attr("width", cloud.options.width).attr("height", cloud.options.height).append("g").attr("transform", "translate(" + ((cloud.options.width/2)) + "," + ((cloud.options.height/2)) + ")").append('rect').attr("transform", "translate(-" + ((cloud.options.width/2)) + ",-" + ((cloud.options.height/2)*0.8) + ")").attr('x', 0).attr('y', 0).attr('width', '100%').attr('height', '80%').style('fill', (cloud.options.backgroundColor == "") ? 'white' : cloud.options.backgroundColor);
            d3.select('g').selectAll("text").data(data).enter().append("text").attr('class', 'word').style("font-size", function(d) {
                return d.size + "px";
            }).style("font-family", cloud.options.font_name).style("fill", function(d, i) {
                return fill(i);
            }).attr("text-anchor", "middle").attr("transform", function(d) {
                return "translate(" + [d.x + 30, d.y] + ")rotate(" + d.rotate + ")";
            }).text(function(d) {
                return d.text;
            });
            d3.select('svg').append('text').attr('id', 'cloudTitle').text(cloud.options.title).style('font-size', cloud.options.titleFontSize + 'px').attr('text-anchor', 'middle').attr('y', cloud.options.height - (cloud.options.titleFontSize)).attr('x', cloud.options.width / 2);

            //add wordlist
            if($('#wordCloudWordList').length ==0){
            $('#containerDiv').append($('<a>').attr('id', 'cloudShowListButton').css({
                position : 'absolute',
                top : '10px',
                left : 0,
                width : '25px',
                height : '20px'
            }).click(function() {
                $('#wordCloudWordList').toggle();
            }).button({
                icons : {
                    primary : 'ui-icon-script'
                }
            }).hide());

            $('#containerDiv').append($('<div>', {
                id : 'wordCloudWordList',
                css : {
                    position :'absolute',
                    top : '10px',
                    left : '20px',
                    height : (cloud.options.height * 0.6) + "px",
                    width : '120px',
                    borderRadius : '8px',
                    border : '5px solid #EEE',
                    backgroundColor : 'white',
                    overflow: 'scroll',
                    padding: '5px',
                }
            }).hide());
            }
            d3.selectAll('.listEntry').remove();
            
            d3.select('#wordCloudWordList').selectAll('.listEntry').data(cloud.d).enter().append('div').attr('class','listEntry').style('vertical-align','middle').style('height','20px').style('width', '100px').text(function(d) {
                return d.text + " (" + d.freq + ")";
            }).on('click', function(d){
                //More SEA events
                console.log(d.text + " : " +  Math.ceil(d.size / ((cloud.options.height / 3) / cloud.max)));
                shivaLib.SendShivaMessage("ShivaWord=click|" + d.text + "|" +  Math.ceil(d.size / ((cloud.options.height / 3) / cloud.max)));
                $('.listEntry').css('backgroundColor','white');
                $(this).css('backgroundColor', 'rgba(255,255,105,0.5)');
            });
            $('.listEntry').append($('<span>',{
                css: {
                    float: 'right'
                }
            }).addClass('listEntryFilter ui-icon ui-icon-close').on('click', function(e){
                var pass; 
                if(typeof e.data =="undefined")
                    pass = false;
                else{
                    if(typeof e.data.pass=="undefined")
                        pass = false;
                    else{
                        pass = e.data.pass;
                    }
                }
                e.stopPropagation();
                if($(this).hasClass('ui-icon-close')){
                    $(this).removeClass('ui-icon-close').addClass('ui-icon-arrowreturnthick-1-w');
                    $(this).parent().css('opacity',0.5);
                }
                else{
                    $(this).removeClass('ui-icon-arrowreturnthick-1-w').addClass('ui-icon-close');
                    $(this).parent().css('opacity',1);   
                }
                var word = $(this).parent().text().split(' ')[0];
                if(!pass)
                    cloud.filter();                
            }));
            
            $('.listEntry').each(function(){
                if(!data.find($(this).text().split(' ')[0], "text"))
                    $(this).find('span').click({pass: true})
            });
            
            if (cloud.options.wordlist == "true") {
                $('#cloudShowListButton').show();
            }
            
            //add colors if necessary
            if(cloud.options.spectrum!="")
                cloud.colorize(cloud.options.spectrum);
            
            //Bind Events for SHIVA Messages
            d3.selectAll('.word').on("click", function(d) {
                console.log(d.text + " : " +  Math.ceil(d.size / ((cloud.options.height / 3) / cloud.max)));
                shivaLib.SendShivaMessage("ShivaWord=click|" + d.text + "|" +  Math.ceil(d.size / ((cloud.options.height / 3) / cloud.max)));
            });
            //ready
            shivaLib.SendShivaMessage("ShivaWord=ready");
        };
        this.buildLayout = function(data) {
            var fs;
            if(cloud.options.scale=="logarithmic")
                fs = d3.scale.log().range([10,100]);
            else if(cloud.options.scale=="linear")
                fs = d3.scale.linear().domain([0, data[0].freq]).range([10,100]);
            else if(cloud.options.scale =="binary")
                fs = d3.scale.quantile().range([0,(cloud.options.height/(data.length/5))]);
                  
            var high,low;      
            low = (cloud.options.low_threshold=='')?0:parseInt(cloud.options.low_threshold);
            high = (cloud.options.high_threshold=='')?100000000000:parseInt(cloud.options.high_threshold);
            data = data.filter(function(el){
                return el.freq >= low && el.freq <= high;
            });
            
            d3.layout.cloud().size([cloud.options.width, cloud.options.height * 0.8]).words(data).rotate(function() {
                return ~~((Math.random() * 2) * cloud.options.tiltRange)*((Math.random()>0.5)?1:-1);
            }).font(cloud.options.font_name).fontSize(function(d) {
                return fs(d.freq);
            }).on("end", cloud.draw).start();
        };
        this.load = function(src, algo) {
            if ( typeof algo == "undefined")
                algo = "raw";
            d3.select('svg').remove();
            var qs = 'parser.php?' + encodeURIComponent('url') + '=' + encodeURIComponent(src) + "&" + encodeURIComponent('a') + '=' + encodeURIComponent(algo);
            d3.json(qs, function(error, data) {
                if (data.error) {
                    if (data.error == "fetch_fail")
                        alert("Sorry we didn't find anything at that URL. Plese make sure it is correct.");
                    else if (data.error == "robots")
                        $('<div id="wordcloudError"><p> SHIVA has detected that the site you are trying to access has set a robots.txt policy that prohibits machine access to the content you are trying to fetch. Please instead copy and paste the text from the page you would like to access into the text box to the right of "Data source URL". <br /><br /> For more information about robots.txt, please visit <a target="_blank" href="http://www.robotstxt.org/robotstxt.html">this page.</a></p></div>').dialog({
                            appendTo : 'body',
                            position : 'top'
                        });
                    return false;
                }
                cloud.d = data;
                cloud.buildLayout(data);
            });
        };
        this.filter = function(){
            var words = [];
            $('.listEntry').filter(function(){
                return $(this).children('span').hasClass('ui-icon-close');
            }).each(function(){
                words.push($(this).text().split(' ')[0]);
            });
            var d = cloud.d.filter(function(el){
                if(words.indexOf(el.text) == -1){
                    cloud.filterSet.push(el.text);
                    return false;
                }
                else
                    return true;
            });
            cloud.buildLayout(d);
        };
        this.colorize = function(colors){
             var opts = colors.split(',').slice(0, -1);
                            if (opts.length == 1)
                                opts.push('ffffff');
                            var spec = [];
                            for (var j = 1; j < opts.length; j++) {
                                var s = d3.hsl('#' + opts[j - 1]);
                                var e = d3.hsl('#' + opts[j]);
                                spec.push(d3.interpolate(s, e));
                            }
                            var size = cloud.d[0].freq + 1;
                            d3.selectAll('.word').style('fill', function(d, i) {
                                var hole = Math.floor((cloud.d[i].freq / size) * spec.length);
                                var rem = (cloud.d[i].freq / size) * spec.length % 1;
                                return spec[hole](rem);
            });
        };
    }
}

SHIVA_Show.prototype.WordActions = function(msg) {
    var m = msg.split('=')[1];
    var cmd = m.split('|');
    switch(cmd[0]) {
        case 'data':
            if (/^http/gi.test(cmd[1])) {
                //parse URL
                this.wcloud.load(cmd[1]);
            } else {
                try {
                    //check if JSON
                    var json = JSON.parse(cmd[1]);
                    json.sort(function(a, b) {
                        return a.size - b.size;
                    });
                    this.wcloud.buildLayout(json.slice(0, this.wcloud.options.wordcount));
                } catch(e) {
                    //parse raw
                    this.wcloud.load(cmd[1]);
                }
            }
            break;
    }
}