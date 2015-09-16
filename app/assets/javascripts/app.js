console.log('scripts loaded');

var token = $('#api-token').val();
$.ajaxSetup({
  headers: {
    "accept": "application/json",
    "token": token
  }
});

var app = app || {};

app.Trade = Backbone.Model.extend({
  defaults: {
    'company_symbol': 'tbd',
    'number_of_shares': 0,
    'share_purchase_price': 0,
    'trade_type': 'tbd',
  },
});

app.TradeCollection = Backbone.Collection.extend({
  model: app.Trade,
  url: '/api/trades'
});

app.TradeView = Backbone.View.extend({
  tagName: 'tr',
  className: 'trade',
  template: _.template( $('#trade-template').html() ),
  render: function(){
    this.$el.empty();
    var html = this.template( this.model );
    var $html = $( html );
    this.$el.append( $html );
  }
});

app.TradeListView = Backbone.View.extend({
  initialize: function(){
    this.listenTo( this.collection, 'add', this.render );
  },
  render: function(){
    this.$el.empty();
    this.$el.append('<tr class="header-row"><td>Symbol</td><td>Quantity</td><td>Cost Basis</td><td>Last Price</td><td>Current Value</td><td></td><td></td></tr>');
    var data = companyData();
    var trades = data[0];
    var view;
    for ( var i = 0; i < trades.length; i++ ){
      view = new app.TradeView({
        model: trades[ i ]
      });
      view.render();
      this.$el.append( view.$el );
    }
    this.$el.append('<tr><td><b>Total:</b></td>' + '<td>' + data[1][0] + '</td>' + '<td>$' + data[1][1] + '</td><td></td><td></td></tr>');
  },
  events: {
    'load window': 'addPrices'
  }
});

app.trades = new app.TradeCollection();

app.tradePainter = new app.TradeListView({
  collection: app.trades,
  el: $('#trades-table')
});

app.trades.fetch();

$(document).on('click', '.preview_order', function(e){
  $this = $(this);
  var numShares = $this.parent().parent().find('.numShares');
  if ( numShares.val() ==="" ) {
    numShares.css('border','1px solid red');
  } else {
    $this = $(this);
    numShares.css('border', '1px solid black');
    console.log('shares:' + numShares.val());
    $('#previewNumShares').html(numShares.val());
    $('#preview-number-of-shares').val(numShares.val());
    var price = $('#previewstockPrice').html();
    var order = ((numShares.val()*price)+7.95).toFixed(2);
    $('#preview-order-value').html(order);
    var tradeType = $this.parent().prev().prev().children().first().val();
    $('#preview-trade-type').val(tradeType);
    $('#previewTradeType').html(tradeType.charAt(0).toUpperCase() + tradeType.substring(1));
    $('#PreviewModal').modal('show');
  }
});

$(document).on('click', '#buy-button', function(e){
    $this = $(this);
    var stock = $this.data('symbol');
    $('.buy-symbol').val(stock);
    getStock(stock);
});
$(document).on('click', '#sell-button', function(e){
    $this = $(this);
    var stock = $this.data('symbol');
    $('.buy-symbol').val(stock);
    getStock(stock);
});
function getStock(stock) {
      $.ajax({
        url: '//dev.markitondemand.com/Api/v2/Quote/jsonp',
        data: {'symbol': stock},
        jsonp: "callback",
        dataType: "jsonp",
        success: function(ds){
          drawHtml(ds);
        }
      });
      return false;
}
function drawHtml(jsonResult) {
    console.log('draw');
      $('.stockPrice').html(jsonResult.LastPrice);
      $('#previewstockPrice').html(jsonResult.LastPrice);

      $('.coSymbol').html(jsonResult.Symbol);
      $('.coSymb').html(jsonResult.Symbol);

      // $('#numShares').html($('#modalNumShares').val());
      $('.buy-company-symbol').val(jsonResult.Symbol);
      // $('#number-of-shares').val($('#modalNumShares').val());
      return false;
}

function companyData() {

  var companyTotals = {};
  var totals = {'total_portfolio_shares':0, 'total_portfolio_basis':0};
  var indTrades = app.trades.models;
  for (var i = 0; i < indTrades.length; i++){
    if (indTrades[i].attributes.trade_type === 'buy'){
      totals.total_portfolio_shares += indTrades[i].attributes.number_of_shares;
      totals.total_portfolio_basis+=(indTrades[i].attributes.number_of_shares*indTrades[i].attributes.share_purchase_price);
    } else {
      totals.total_portfolio_shares -= indTrades[i].attributes.number_of_shares;
    }
    if (companyTotals[indTrades[i].attributes.company_symbol]){
      if (indTrades[i].attributes.trade_type === 'buy'){
        companyTotals[indTrades[i].attributes.company_symbol][0] += indTrades[i].attributes.number_of_shares;
        companyTotals[indTrades[i].attributes.company_symbol][1] += (indTrades[i].attributes.number_of_shares*indTrades[i].attributes.share_purchase_price);
      } else {
        companyTotals[indTrades[i].attributes.company_symbol][0] -= indTrades[i].attributes.number_of_shares;
      }
    } else {
      if (indTrades[i].attributes.trade_type === 'buy'){
        companyTotals[indTrades[i].attributes.company_symbol] = [indTrades[i].attributes.number_of_shares, (indTrades[i].attributes.number_of_shares*indTrades[i].attributes.share_purchase_price)] ;
      }
    }
  }
  companyArray = [];
  portfolioTotals = [];
  var lastPrice;
  for (var symbol in companyTotals) {
    companyArray.push({'company_symbol':symbol, 'number_of_shares':companyTotals[symbol][0], 'basis':companyTotals[symbol][1], 'last_price': lastPrice});
  }
  portfolioTotals.push(totals.total_portfolio_shares, totals.total_portfolio_basis);
  return [companyArray,portfolioTotals];
}

$('form.create-trade').on('submit', function(e){
  e.preventDefault();
  var newCompanySymbol = $("#buy-company-symbol").val();
  var newNumberOfShares = $("#preview-number-of-shares").val();
  var newTradeType = $("#preview-trade-type").val();
  app.trades.create({company_symbol: newCompanySymbol, number_of_shares: newNumberOfShares, trade_type: newTradeType});
  $('#PreviewModal').modal('hide');
  $('#buyModal').modal('hide');
  $('#sellModal').modal('hide');
  $('#ConfirmModal').modal('show');
});

function addPrices(){
  var companies = $('.company');
  var price = $('.current-price');
  var shares = $('.shares');
  var value = $('.totalValue');
  for (var i = 0; i < companies.length; i++){
    (function (i){
      $company = $(companies[i]);
      var symbol1 = $company.data('symbol');
      var symbol2 = '#' + $company.data('symbol');
      $.ajax({
        url: '//dev.markitondemand.com/Api/v2/Quote/jsonp',
        data: {'symbol': symbol1},
        jsonp: "callback",
        dataType: "jsonp",
        success: function(ds){
          $(symbol2).append(ds.LastPrice);
          value[i].textContent = '$' + parseInt(price[i].textContent)*parseInt(shares[i].textContent);
        }
      });
    })(i);
  }
}

$(window).load(function(){
  setTimeout(function(){
    addPrices();
  },1000);
});
