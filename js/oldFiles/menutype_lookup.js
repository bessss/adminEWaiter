Ext.onReady(function()
{
  create_munuType_lookup();
});

function create_munuType_lookup()
{
  Ext.create('Ext.data.Store', {
    storeId:'menutypeStore',
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
        change_menuType();
      }
    },
    autoLoad: true
  });

  Ext.create('Ext.form.ComboBox', {
    id: 'menutype_lookup',
    editable: false,
    fieldLabel: 'Раздел меню',
    store: Ext.data.StoreManager.lookup('menutypeStore'),
    queryMode: 'local',
    displayField: 'menuType',
    valueField: 'id',
    margin: 10
  });
}

function change_menuType()
{
  Ext.getCmp('menutype_lookup').select( Ext.getStore('menutypeStore').data.items[0].data.id );
  Ext.getCmp('menutype_lookup').on('select',function(){
    Ext.getStore('menuStore').proxy.extraParams = {'menuType': Ext.getCmp('menutype_lookup').lastValue};
    Ext.getStore('menuStore').load();
  });
}