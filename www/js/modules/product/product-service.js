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

angular.module('dorrbell').filter('listSorter', function(){
  return function(res, query){
    var values = new Array();
    var customValue = true;
    for(var i in res){
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
