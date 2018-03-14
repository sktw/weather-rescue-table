const manifests = [{
    id: '2016 Ventnor - Cowes Max Min',
    year: '2016',
    locationsTitle: 'Ventnor - Cowes',
    columnsTitle: 'Max Min',
    locations: ['Ventnor', 'Cowes'],
    blocks: [2],
    columns: [{
        title: 'Location',
        type: 'header'
    },
    {
        title: 'Max',
        type: 'temperature',
    },
    {
        title: 'Min',
        type: 'temperature',
    }]
},
{
    id: '2018 Southampton - Brighton Pressure Temp. Rainfall',
    year: '2018',
    locationsTitle: 'Southampton - Brighton',
    columnsTitle: 'Pressure Temp. Rainfall',
    locations: ['Southampton', 'Portsmouth', 'Worthing', 'Brighton'],
    blocks: [2, 2],
    columns: [{
        title: 'Location',
        type: 'header'
    },
    {
        title: 'Pressure',
        type: 'pressure',
    },
    {
        title: '[ignore]',
        ignore: true
    },
    {
        title: 'Temp.',
        type: 'temperature',
    },
    {
        title: 'Rainfall',
        type: 'rainfall'
    }]
},
{
    id: '2018 Ventnor - Cowes Max Min',
    year: '2018',
    locationsTitle: 'Ventnor - Cowes',
    columnsTitle: 'Max Min',
    locations: ['Ventnor', 'Cowes'],
    blocks: [2],
    columns: [{
        title: 'Location',
        type: 'header'
    },
    {
        title: 'Max',
        type: 'temperature',
    },
    {
        title: 'Min',
        type: 'temperature',
    }]
}];

export default manifests;
