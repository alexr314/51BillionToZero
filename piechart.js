var salesData;
        var chartInnerDiv = '<div class="innerCont" style="overflow: auto; height:91% ; Width:100% ;position: relative;overflow: hidden;"/>';
        var truncLengh = 30;
    
        $(document).ready(function () {
            Plot();
        });
    
        function Plot() {
            TransformChartData(chartData, chartOptions, 0);
            BuildPie("chart", chartData, chartOptions, 0)
        }
    
        function BuildPie(id, chartData, options, level) {
            var xVarName;
            var divisionRatio = 2.5;
            var legendoffset = (level == 0) ? 0 : -40;
    
            d3.selectAll("#" + id + " .innerCont").remove();
            $("#" + id).append(chartInnerDiv);
            chart = d3.select("#" + id + " .innerCont");
    
            var yVarName = options[0].yaxis;
            width = $(chart[0]).outerWidth(),
            height = $(chart[0]).outerHeight(),
            radius = Math.min(width, height) / divisionRatio;
    
            if (level == 1) {
                xVarName = options[0].xaxisl1;
            }
            else {
                xVarName = options[0].xaxis;
            }
    
            var rcolor = d3.scale.ordinal().range(runningColors);
    
            arc = d3.svg.arc()
                    .outerRadius(radius)
                    .innerRadius(radius - 200);
    
            var arcOver = d3.svg.arc().outerRadius(radius + 20).innerRadius(radius - 180);
    
            chart = chart
                    .append("svg")  //append svg element inside #chart
                    .attr("width", width)    //set width
                    .attr("height", height)  //set height
                    .append("g")
                    .attr("transform", "translate(" + (width / divisionRatio) + "," + ((height / divisionRatio) + 30) + ")")
                    .attr("align","right");
    
            var pie = d3.layout.pie()
                        .sort(null)
                        .value(function (d) {
                            return d.Total;
                        });
    
            var g = chart.selectAll(".arc")
                        .data(pie(runningData))
                        .enter().append("g")
                        .attr("class", "arc")
                        .attr("align","right");
    
            var count = 0;
    
            var path = g.append("path")
                        .attr("d", arc)
                        .attr("align","right")
                        .attr("id", function (d) { return "arc-" + (count++); })
                        .style("opacity", function (d) {
                            return d.data["op"];
                        });
    
            path.on("mouseenter", function (d) {
                d3.select(this)
                    .attr("stroke", "white")
                    .attr("align","right")
                    .transition()
                    .duration(200)
                    .attr("d", arcOver)
                    .attr("stroke-width", 1);
                    
            })
             .on("mouseleave", function (d) {
                 d3.select(this).transition()
                     .duration(200)
                     .attr("align","right")
                     .attr("d", arc)
                     .attr("stroke", "none");
             })
             .on("click", function (d) {
                 if (this._listenToEvents) {
                     // Reset inmediatelly
                     d3.select(this).attr("transform", "translate(0,0)")
                     // Change level on click if no transition has started
                     path.each(function () {
                         this._listenToEvents = false;
                     });
                 }
                 d3.selectAll("#" + id + " svg").remove();
                 if (level == 1) {
                     TransformChartData(chartData, options, 0, d.data[xVarName]);
                     BuildPie(id, chartData, options, 0);
                 }
                 else {
                     var nonSortedChart = chartData.sort(function (a, b) {
                         return parseFloat(b[options[0].yaxis]) - parseFloat(a[options[0].yaxis]);
                     });
                     TransformChartData(nonSortedChart, options, 1, d.data[xVarName]);
                     BuildPie(id, nonSortedChart, options, 1);
                 }
    
             });
    
            path.append("svg:title")
            .text(function (d) {
                return d.data["title"] + " (" + d.data[yVarName] + ")";
            });
    
            path.style("fill", function (d) {
                return rcolor(d.data[xVarName]);
            })
             .transition().duration(1000).attrTween("d", tweenIn).each("end", function () {
                 this._listenToEvents = true;
             });
    
    
            g.append("text")
             .attr("transform", function (d) { return "translate(" + arc.centroid(d) + ")"; })
             .attr("dy", ".35em")
             .style("text-anchor", "middle")
             .style("opacity", 1)
             .text(function (d) {
                 return d.data[yVarName];
             });
    
            count = 0;
            var legend = chart.selectAll(".legend")
                .data(runningData).enter()
                .append("g").attr("class", "legend")
                .attr("legend-id", function (d) {
                    return count++;
                })
                .attr("transform", function (d, i) {
                    return "translate(15," + (parseInt("-" + (runningData.length * 10)) + i * 28 + legendoffset) + ")";
                })
                .style("cursor", "pointer")
                .on("click", function () {
                    var oarc = d3.select("#" + id + " #arc-" + $(this).attr("legend-id"));
                    oarc.style("opacity", 0.3)
                    .attr("stroke", "white")
                    .transition()
                    .duration(200)
                    .attr("d", arcOver)
                    .attr("stroke-width", 1);
                    setTimeout(function () {
                        oarc.style("opacity", function (d) {
                            return d.data["op"];
                        })
                       .attr("d", arc)
                       .transition()
                       .duration(200)
                       .attr("stroke", "none");
                    }, 1000);
                });
    
            var leg = legend.append("rect");
    
            leg.attr("x", width / 2)
                .attr("width", 18).attr("height", 18)
                .style("fill", function (d) {
                    return rcolor(d[yVarName]);
                })
                .style("opacity", function (d) {
                    return d["op"];
                });
            legend.append("text").attr("x", (width / 2) - 5)
                .attr("y", 9).attr("dy", ".35em")
                .style("text-anchor", "end").text(function (d) {
                    return d.caption;
                });
    
            leg.append("svg:title")
            .text(function (d) {
                return d["title"] + " (" + d[yVarName] + ")";
            });
    
            function tweenOut(data) {
                data.startAngle = data.endAngle = (2 * Math.PI);
                var interpolation = d3.interpolate(this._current, data);
                this._current = interpolation(0);
                return function (t) {
                    return arc(interpolation(t));
                };
            }
    
            function tweenIn(data) {
                var interpolation = d3.interpolate({ startAngle: 0, endAngle: 0 }, data);
                this._current = interpolation(0);
                return function (t) {
                    return arc(interpolation(t));
                };
            }
    
        }
    
        function TransformChartData(chartData, opts, level, filter) {
            var result = [];
            var resultColors = [];
            var counter = 0;
            var hasMatch;
            var xVarName;
            var yVarName = opts[0].yaxis;
    
            if (level == 1) {
                xVarName = opts[0].xaxisl1;
    
                for (var i in chartData) {
                    hasMatch = false;
                    for (var index = 0; index < result.length; ++index) {
                        var data = result[index];
    
                        if ((data[xVarName] == chartData[i][xVarName]) && (chartData[i][opts[0].xaxis]) == filter) {
                            result[index][yVarName] = result[index][yVarName] + chartData[i][yVarName];
                            hasMatch = true;
                            break;
                        }
    
                    }
                    if ((hasMatch == false) && ((chartData[i][opts[0].xaxis]) == filter)) {
                        if (result.length < 9) {
                            ditem = {}
                            ditem[xVarName] = chartData[i][xVarName];
                            ditem[yVarName] = chartData[i][yVarName];
                            ditem["caption"] = chartData[i][xVarName].substring(0, 10) + '...';
                            ditem["title"] = chartData[i][xVarName];
                            ditem["op"] = 1.0 - parseFloat("0." + (result.length));
                            result.push(ditem);
    
                            resultColors[counter] = opts[0].color[0][chartData[i][opts[0].xaxis]];
    
                            counter += 1;
                        }
                    }
                }
            }
            else {
                xVarName = opts[0].xaxis;
    
                for (var i in chartData) {
                    hasMatch = false;
                    for (var index = 0; index < result.length; ++index) {
                        var data = result[index];
    
                        if (data[xVarName] == chartData[i][xVarName]) {
                            result[index][yVarName] = result[index][yVarName] + chartData[i][yVarName];
                            hasMatch = true;
                            break;
                        }
                    }
                    if (hasMatch == false) {
                        ditem = {};
                        ditem[xVarName] = chartData[i][xVarName];
                        ditem[yVarName] = chartData[i][yVarName];
                        ditem["caption"] = opts[0].captions != undefined ? opts[0].captions[0][chartData[i][xVarName]] : "";
                        ditem["title"] = opts[0].captions != undefined ? opts[0].captions[0][chartData[i][xVarName]] : "";
                        ditem["op"] = 1;
                        result.push(ditem);
    
                        resultColors[counter] = opts[0].color != undefined ? opts[0].color[0][chartData[i][xVarName]] : "";
    
                        counter += 1;
                    }
                }
            }
    
            runningData = result;
            runningColors = resultColors;
            return;
        }
    
        chartOptions = [{
            "captions": [{ "Making Things": "Making Things", "Plugging In": "Plugging In", "Growing Things": "Growing Things", "Transportation": "Transportation", "Keeping Warm & Cool": "Keeping Warm & Cool", "Removed": "Removed" }],
            "color": [{ "Making Things": "#FFA500", "Plugging In": "#0070C0", "Growing Things": "#ff0000", "Transportation": "#cde074", "Keep Warm & Cool": "#ffccff", "Removed": "#000000" }],
            "xaxis": "Activity",
            "xaxisl1": "Item",
            "yaxis": "Total"
        }]
    
        var chartData = [
            {
                "Activity": "Making Things",
                "Item": "Cement and Concrete",
                "Total": 10
            },
            {
                "Activity": "Making Things",
                "Item": "Iron and Steel",
                "Total": 7.4
            },
            {
                "Activity": "Making Things",
                "Item": "Plastic",
                "Total": 2.8
            },
            {
                "Activity": "Making Things",
                "Item": "Wood",
                "Total": 1.8
            },
            {
                "Activity": "Making Things",
                "Item": "Aluminum",
                "Total": 1.2
            },
            {
                "Activity": "Making Things",
                "Item": "Glass",
                "Total": 0.8
            },
            {
                "Activity": "Making Things",
                "Item": "Other metals",
                "Total": 2.2
            },
            {
                "Activity": "Making Things",
                "Item": "Paper",
                "Total": 0.6
            },
            {
                "Activity": "Making Things",
                "Item": "Other minerals",
                "Total": 2.2
            },
            {
                "Activity": "Making Things",
                "Item": "Other sources",
                "Total": 2
            },
            {
                "Activity": "Plugging In",
                "Item": "Coal",
                "Total": 10.8
            },
            {
                "Activity": "Plugging In",
                "Item": "Oil",
                "Total": 8.9
            },
            {
                "Activity": "Plugging In",
                "Item": "Gas",
                "Total": 5.5
            },
            {
                "Activity": "Plugging In",
                "Item": "Other Sources",
                "Total": 1.8
            },
            {
                "Activity": "Growing Things",
                "Item": "Timber",
                "Total": 2.1
            },
            {
                "Activity": "Growing Things",
                "Item": "Livestock & Manure",
                "Total": 5.5
            },
            {
                "Activity": "Growing Things",
                "Item": "Cropland",
                "Total": 1.3
            },
            {
                "Activity": "Growing Things",
                "Item": "Crop Burning",
                "Total": 3.3
            },
            {
                "Activity": "Growing Things",
                "Item": "Rice Cultivation",
                "Total": 1.2
            },
            {
                "Activity": "Growing Things",
                "Item": "Agricultural Soils",
                "Total": 3.9
            },
            {
                "Activity": "Growing Things",
                "Item": "Energy in Agriculture & Fishing",
                "Total": 1.7
            },
            {
                "Activity": "Transportation",
                "Item": "Road",
                "Total": 11.7
            },
            {
                "Activity": "Transportation",
                "Item": "Aviation",
                "Total": 1.9
            },
            {
                "Activity": "Transportation",
                "Item": "Rail",
                "Total": 0.4
            },
            {
                "Activity": "Transportation",
                "Item": "Pipeline",
                "Total": 0.3
            },
            {
                "Activity": "Transportation",
                "Item": "Ship",
                "Total": 1.7
            },
            {
                "Activity": "Keeping Warm & Cool",
                "Item": "General",
                "Total": 7
            },
            {
                "Activity": "Removed",
                "Item": "Removed",
                "Total": 0
            }

        ];

        function updateValue(checkBox, index, amount) {
            console.log("before Value is " + chartData[27]["Total"]);
            if (checkBox.checked){
                chartData[index]["Total"] -= amount;
                chartData[27]["Total"] += amount;
            } else {
              chartData[index]["Total"] += amount;
              chartData[27]["Total"] -= amount;
            }

            console.log("after Value is " + chartData[27]["Total"]);
        }
    
        function myFunction() {
            updateValue(document.getElementById("myCheck1"), 0, 7);  
           Plot();
          }