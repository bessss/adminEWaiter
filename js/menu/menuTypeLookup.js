function menuTypeLookup(owner)
{
  this.menuTypeStore = new Object();
  this.lookup = new Object();
  this.owner = owner;

  this.menuTypeLookup_Create = menuTypeLookup_Create;
  this.menuType_Set = menuType_Set;

  this.menuTypeLookup_Create();
}

function menuTypeLookup_Create()
{
  var self = this;
  this.menuTypeStore = Ext.create('Ext.data.Store', {
    storeId:'menuTypeStore',
    fields:['removability', 'editability','menuType', 'id', 'common'],
    proxy: 
    {
      type: 'ajax',
      url: '../outputs/outputMenuType.php?bssid=' + owner_object.restorant['bssid'],
      reader: 
      {
        type: 'json',
        totalProperty: 'totalCount'
      }
    },
    listeners:
    {
      load: function()
      {
        self.menuType_Set();
      }
    },
    autoLoad: true
  });

  this.lookup = Ext.create('Ext.form.ComboBox', {
    id: 'menuTypeLookup',
    editable: false,
    fieldLabel: 'Раздел меню',
    store: Ext.data.StoreManager.lookup('menuTypeStore'),
    queryMode: 'local',
    displayField: 'menuType',
    valueField: 'id',
    margin: 10
  });
}

function menuType_Set()
{
  Ext.getCmp('menuTypeLookup').select( Ext.getStore('menuTypeStore').data.items[0].data.id );
  Ext.getCmp('menuTypeLookup').on('select',function(){
    Ext.getStore('menuStore').proxy.extraParams = {'menuType': Ext.getCmp('menuTypeLookup').lastValue};
    Ext.getStore('menuStore').load();
  });
}