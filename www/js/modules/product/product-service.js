angular.module('dorrbell').service("ProductValidator", function(){

  this.validateStep1 = function(product, meta){
    return product.title
        && product.title.trim().length > 1
        /*
        && product.sku
        && product.sku.trim().length > 1
        */
        && product.product_type;
  }

  this.validateStep2 = function(tag){
    return tag.gender
        && tag.gender.trim().length > 1
        && tag.category
        && tag.category.trim().length > 1;
  }

  this.validateSave = function(product, meta, tag){
    return (this.validateStep1(product, meta) && this.validateStep2(tag));
  }

});

angular.module('dorrbell').service('ProductService', function(){
  this.getShopifyProduct = function(product){
    var tags = product.Tags__c.split(",");
    var p = {
      id : product.Shopify_Id__c,
      title : product.Name,
      tags : tags,
      sku : product.SKU__c,
      product_type : product.Family
    }

    if(product.Image__r){
      p.image = {
        id : product.Image__r.Shopify_Id__c,
        src : product.Image__r.Image_Source__c
      }
    }
    if(product.Images__r && product.Images__r.records){
      p.images = new Array();
      for(var i = 0; i<product.Images__r.records.length; i++){
        var img = product.Images__r.records[i];
        p.images.push({
          id : img.Shopify_Id__c,
          position: img.Position__c,
          src : img.Image_Source__c
        });
      }
    }else
        p.images = new Array();
    return p;
  },

  this.descriptionParser = function(html){
    var parser = new DOMParser();
    var doc = parser.parseFromString(html, 'text/html');

    var selectors = ["description", "fit", "materials", "condition", "notes", "care"];
    var d = {};
    for(var i = 0; i<selectors.length; i++){
      if(doc.querySelector("#" + selectors[i]))
        d[selectors[i]] = doc.querySelector("#" + selectors[i]).innerHTML;
    }
    return d;
  },

  this.descriptionToHtml = function(info){
    var html = "";
    if(info.description)
      html += '<b style="display:inline-block;min-width:6rem;">Description:</b><span id="description" style="margin-right:1rem;">' + info.description + '</span><br/>';
    if(info.fit)
      html += '<b style="display:inline-block;min-width:6rem;">Fit:</b><span id="fit" style="margin-right:1rem;">' + info.fit + '</span><br/>';
    if(info.materials)
      html += '<b style="display:inline-block;min-width:6rem;">Materials:</b><span id="materials" style="margin-right:1rem;">' + info.materials + '</span><br/>';
    if(info.condition)
      html += '<b style="display:inline-block;min-width:6rem;">Condition:</b><span id="condition" style="margin-right:1rem;">' + info.condition + '</span><br/>';
    if(info.notes)
      html += '<b style="display:inline-block;min-width:6rem;">Notes:</b><span id="notes" style="margin-right:1rem;">' + info.notes + '</span><br/>';
    if(info.care)
      html += '<b style="display:inline-block;min-width:6rem;">Care:</b><span id="care" style="margin-right:1rem;">' + info.care + '</span><br/>';

    return html;
  }
});

angular.module('dorrbell').filter('listSorter', function(){
  return function(res, query){
    var values = new Array();
    var customValue = true;
    for(var i = 0; i < res.length; i++){
      if(res[i].indexOf(query) != -1)
        values.push(res[i]);
      if(res[i] == query)
        customValue = false;
    }
    if(customValue && query && query.trim().length > 0)
      values.push(query);
    return values.sort();
  }
});
