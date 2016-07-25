(function ($) {
	var apiUrl = "https://api.nutritionix.com/v1_1/";
	var appId = "893c1242";
	var appKey= "7d079e3fb37bf773618916953f561b82";
	var totalCalories = 0;

	var FoodItem = Backbone.Model.extend({
		defaults: {
		  item_id: 'item_id',
		  brand_name: 'brand_name',
		  item_name: 'item_name',
		  nf_calories: 'nf_calories',
		  nf_serving_size_qty: 'nf_serving_size_qty',
		  nf_serving_size_unit:'nf_serving_size_unit',
		  nf_total_fat:"nf_total_fat"
		}
	});

	var SearchFoodList = Backbone.Collection.extend({
		model: FoodItem,
		url:'',
		//replace ajax with backbone fetch and parse.
		parse:function(res) {
			if (res.hits.length>0) {
				for (var i = 0; res.hits.length > i; i++) {
					var iid = res.hits[i].fields.item_id;
					var bname = res.hits[i].fields.brand_name;
					var iname = res.hits[i].fields.item_name;
					var calories = res.hits[i].fields.nf_calories;
					var qty = res.hits[i].fields.nf_serving_size_qty;
					var unit = res.hits[i].fields.nf_serving_size_unit;
					var fat = res.hits[i].fields.nf_total_fat || "N/A";
					var item = new FoodItem();
					item.set({
						item_id: iid,
						brand_name: bname,
						item_name: iname,
						nf_calories: calories,
						nf_serving_size_qty: qty,
						nf_serving_size_unit: unit,
						nf_total_fat: fat
					});
					this.add(item);
				}
			}
		},
	});

  	var MyFoodList = Backbone.Collection.extend({
		model: FoodItem
	});

 	var MyFoodItemListView = Backbone.View.extend({
	    	events: {
	      		'click span.removeMyFoodItem':  'removeMyFoodItem'
	    	},

	    	initialize: function(){
	      		_.bindAll(this, 'render', 'removeMyFoodItem');
	     	},

	    	render: function(){
				var di = '<li><b>'+this.model.get('item_name') +'</b> &nbsp; &nbsp; ';
					di += '<span style="font-family:sans-serif; color:blue; cursor:pointer;" class="removeMyFoodItem">[REMOVE]</span> <br>';
					di += 'Brand : '+this.model.get('brand_name') +'<br>';
					di += this.model.get('nf_serving_size_qty') + ' ' + this.model.get('nf_serving_size_unit') + '<br>';
					di += 'Calories : ' + this.model.get('nf_calories') + ' (Total Fat : ' + this.model.get('nf_total_fat')+ ') <br><br></li>';
				$(this.el).html(di);

				this.calculateCalories(this.model.get('nf_calories'));
				$('#totalcalories').text(totalCalories);

	      		return this;
	    	},

	    	removeMyFoodItem: function(){
				this.calculateCalories(-1*this.model.get('nf_calories'));
				$(this.el).remove();
	    	},

	    	calculateCalories: function(cal) {
				totalCalories += cal;
				$('#totalcalories').text('(Total Calories : '+ Math.round(totalCalories * 100) / 100+')');
			}
 	 });

	var SearchItemView = Backbone.View.extend({
    	events: {
      		'click span.addMyFoodItem':  'addMyFoodItem'
    	},

    	initialize: function(){
      		_.bindAll(this, 'render', 'addMyFoodItem');
      		this.myfoodlist = $('#myfoodlist');
    	},

    	render: function(){
			var di = '<li><b>'+this.model.get('item_name') +'</b> &nbsp; &nbsp; ';
				di += '<span style="font-family:sans-serif; color:blue; cursor:pointer;" class="addMyFoodItem">[ADD]</span> <br>';
				di += 'Brand : '+this.model.get('brand_name') +'<br>';
				di += this.model.get('nf_serving_size_qty') + ' ' + this.model.get('nf_serving_size_unit') + '<br>';
				di += 'Calories : ' + this.model.get('nf_calories') + ' (Total Fat : ' + this.model.get('nf_total_fat')+ ') <br><br></li>';
			$(this.el).html(di);
			return this;
    	},

    	addMyFoodItem: function(){
			var myFoodItemView = new MyFoodItemListView({
				model: this.model
			});
      		this.myfoodlist.append(myFoodItemView.render().el);

			//this.myfoodcollection.add(this.model);
	 		$(this.el).remove();
    	},
 	 });

	var SearchListView = Backbone.View.extend({
		el: "body",
	    events: {
			"change input#foodname": "fetchData"
	    },

		initialize: function(){
			_.bindAll(this, 'render', 'fetchData', 'displayItem');

		  	this.searchlist = $('#searchfoodlist');
		  	this.searchcollection = new SearchFoodList();
		  	this.searchcollection.bind('add', this.displayItem);
		},

		/*render: function(){
			var self = this;
		  	_(this.searchcollection.models).each(function(item){
				self.displayItem(item);
		  	}, this);
		},*/

		fetchData: function(){
			var fields = 'item_id,brand_name,item_name,nf_calories,nf_serving_size_qty,nf_serving_size_unit,nf_total_fat';
			var url = apiUrl + "search/" + $("#foodname").val() + "?results=0%3A20&cal_min=0&cal_max=50000&fields="+ fields + "&appId=" + appId + "&appKey=" + appKey;
			this.searchcollection.reset();
			this.searchlist.html('');

			//working code - using fetch/parse - option 1
			this.searchcollection.url=url;
			this.searchcollection.fetch();

			//working code - using ajax - option 0
			/*var self = this;
			$.ajax({
				type: "GET",
				url: url,
				async: true,
				dataType:"JSON",
				success: function (res) {
					if (res.hits.length>0) {
						for (var i = 0; res.hits.length > i; i++) {
							var iid = res.hits[i].fields.item_id;
							var bname = res.hits[i].fields.brand_name;
							var iname = res.hits[i].fields.item_name;
							var calories = res.hits[i].fields.nf_calories;
							var qty = res.hits[i].fields.nf_serving_size_qty;
							var unit = res.hits[i].fields.nf_serving_size_unit;
							var fat = res.hits[i].fields.nf_total_fat || "N/A";
							var item = new FoodItem();
							item.set({
								item_id: iid,
								brand_name: bname,
								item_name: iname,
								nf_calories: calories,
							    nf_serving_size_qty: qty,
								nf_serving_size_unit: unit,
		 						nf_total_fat: fat
		  					});
		  					self.searchcollection.add(item);
						}
					}
				},
				error: function (response) {
					alert('Error' + response);
				},
				complete: function (response) {
					//self.render();
            	}
			});*/
		},

		displayItem: function(item){
			var itemView = new SearchItemView({
				model: item
			});

      		this.searchlist.append(itemView.render().el);
		}
  	});

  	new SearchListView();

}) (jQuery);


/*
{
 "total_hits": 18265,
 "max_score": 3.8158898,
 "hits": [
  {
   "_index": "f762ef22-e660-434f-9071-a10ea6691c27",
   "_type": "item",
   "_id": "547dd3d33055844701f634ae",
   "_score": 3.8158898,
   "fields": {
    "item_id": "547dd3d33055844701f634ae",
    "item_name": "Pizza",
    "brand_id": "5478e63c315c8436480f8635",
    "brand_name": "Pizza Corner",
    "item_description": null,
    "updated_at": "2014-12-02T14:59:31.000Z",
    "nf_ingredient_statement": null,
    "nf_water_grams": null,
    "nf_calories": 340,
    "nf_calories_from_fat": 130,
    "nf_total_fat": 14,
    "nf_saturated_fat": 7,
    "nf_trans_fatty_acid": 0,
    "nf_polyunsaturated_fat": null,
    "nf_monounsaturated_fat": null,
    "nf_cholesterol": 15,
    "nf_sodium": 770,
    "nf_total_carbohydrate": 37,
    "nf_dietary_fiber": 3,
    "nf_sugars": 3,
    "nf_protein": 16,
    "nf_vitamin_a_dv": 10,
    "nf_vitamin_c_dv": 0,
    "nf_calcium_dv": 25,
    "nf_iron_dv": 6,
    "nf_refuse_pct": null,
    "nf_servings_per_container": 5,
    "nf_serving_size_qty": 0.2,
    "nf_serving_size_unit": "pizza",
    "nf_serving_weight_grams": 134,
    "allergen_contains_milk": null,
    "allergen_contains_eggs": null,
    "allergen_contains_fish": null,
    "allergen_contains_shellfish": null,
    "allergen_contains_tree_nuts": null,
    "allergen_contains_peanuts": null,
    "allergen_contains_wheat": null,
    "allergen_contains_soybeans": null,
    "allergen_contains_gluten": null
   }
  }
 ]
}
*/