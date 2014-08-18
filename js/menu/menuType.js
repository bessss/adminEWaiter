function menuType(owner)
{
  this.menuTypePanel = new Object();
  this.menuTypeTable = new Object();
  this.menuTypeOperation = new menuTypeOperation(this);
  this.owner = owner;

  this.menuType_Create = menuType_Create;

  this.menuType_Create();
}
function menuType_Create()
{
  var self = this;

  this.menuTypePanel = Ext.create('Ext.Panel', {
    title: 'Разделы Меню',
    id: 'menuTypePanel'
  });

  this.menuTypeTable = Ext.create('Ext.grid.Panel', {
    id: 'menuTypeTable',
    store: Ext.data.StoreManager.lookup('menuTypeStore'),
    columns: [
      { dataIndex: 'editability', width: 32},
      { dataIndex: 'removability', width: 32},
      { text: 'Название раздела',  dataIndex: 'menuType', flex: 1},
      { text: 'Тип раздела',  dataIndex: 'common', flex: 1}
    ],
    dockedItems: 
    [
      {
        xtype: 'toolbar',
        store: Ext.data.StoreManager.lookup('menuTypeStore'),
        dock: 'bottom',
        displayInfo: true,
        items:
        [
          {
            xtype: 'button',text:'Создать',
            handler:function()
            {
              self.menuTypeOperation.menuType_Edit('new');
            }
          }
        ]
       }
    ]
  });

  Ext.getCmp('menuTypePanel').add(Ext.getCmp('menuTypeTable'));
}