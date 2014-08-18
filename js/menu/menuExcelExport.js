function menuExcelExport(owner)
{
  this.menuExcelPanel = new Object();
  this.menuExcelForm = new Object();
  this.owner = owner;
  this.action = '';

  this.menuExcelPanelExport_Create = menuExcelPanelExport_Create;

  this.menuExcelPanelExport_Create();
}

function menuExcelPanelExport_Create()
{
  this.menuExcelPanel = Ext.create('Ext.Panel', {
    title: 'Выгрузка excel',
    id: 'menuExcelPanel_Export',
    overflowY: 'auto'
  });

  this.menuExcelForm = Ext.create('Ext.form.Panel',{
    height: 120,
    layout: 'column',
    title: 'Фильтр выгрузки Excel',
    margin: 10,
    //border: 0,
    buttonAlign: 'left',
    id: 'menuExcelForm_Export',
    items:[
    {
      xtype: 'combo',
      editable: false,
      fieldLabel: 'Тип меню',
      store: {
        fields: ['id', 'name'],
        data : [
          {'id':'0', 'name':'Все'},
          {'id':'1', 'name':'Индивидуальное'},
          {'id':'2', 'name':'Общее'}
        ]
      },
      queryMode: 'local',
      displayField: 'name',
      valueField: 'id',
      id: 'menuTypeCommon_Filter',
      margin: '10 0 0 10'
    },
    {
      xtype: 'combo',
      id: 'menuType_Filter',
      editable: false,
      fieldLabel: 'Раздел меню',
      store: Ext.data.StoreManager.lookup('menuTypeStore'),
      queryMode: 'local',
      displayField: 'menuType',
      valueField: 'id',
      margin: '10 0 0 10'
    },
    {
      xtype: 'checkbox',
      fieldLabel: 'Без картинки/Все',
      margin: '10 0 0 10',
      id: 'imageCheck_Filter',
      labelWidth: 120
    }],
    buttons:[
    {
      text: 'Получить',
      handler: function()
      {
        window.open('../../outputs/outputMenuExcel.php?bssid=' + owner_object.restorant['bssid'] + '&menuTypeCommon=' + Ext.getCmp('menuTypeCommon_Filter').getValue() + '&imageCheck=' + Ext.getCmp('imageCheck_Filter').getValue() + '&menuType=' + Ext.getCmp('menuType_Filter').getValue());
      }
    }]
  });

  Ext.getCmp('menuExcelPanel_Export').add(Ext.getCmp('menuExcelForm_Export'));
}