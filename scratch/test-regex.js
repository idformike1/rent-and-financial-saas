const testStr = '<Button variant="secondary" size="sm" onClick={() => setSearchTerm(\'\')}>Reset Scan</Button>';
const isNativeButton = /<button[\s>\/]/.test(testStr);
const isComponentButton = /<Button[\s>\/]/.test(testStr);
console.log('isNativeButton:', isNativeButton);
console.log('isComponentButton:', isComponentButton);
