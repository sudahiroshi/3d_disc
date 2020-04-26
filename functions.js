//ベッセル関数計算してを返す関数
function bessel( N , X ){
	//もととなるソースに以下の記述はない
	//しかしこの記述を行わないとN=0のとき正常に描画されない
	if( N == 0 )
		N = 1;
	//ここまで追加記述部分
	var NX = 1;
	for( var i = 1 ; i < N ; i++ ){
		NX *= i ;
	}
	if( NX < 1 )
		console.log('NX < 1\n');
	if( X > 0 ){
		var BE = 1.0 , DB = 1.0 ;
		for( var i = 2 ; i < 100 ; i+=2 ){
			DB = -( Math.pow( X , 2 ) / i / ( 2 * N + i )) * DB ;
			BE += DB ;
		}
		BE *= Math.pow( X / 2 , N ) / NX;
		return BE;
	} else if( N == 0 ){
		return 1;
	} else {
		return 0;
	}
}

//meshを設定する関数
function AutoMeshSetter(geom){
	var mesh= new THREE.Mesh(
		geom,
		new THREE.MeshBasicMaterial( { color: 0xFFFFFF, shading: THREE.FlatShading, wireframe: true ,vertexColors: true } )
	);
	mesh.rotation.x = 210;
	mesh.rotation.y = 620;
	mesh.rotation.z = 150;
//geomの特定の座標データを参照する場合
//	printProperties(geom.vertices[100]);
//同じく、特定の座標の値どれか一つを求める場合　x,y,zのどれか一つ
//	console.log(geom.vertices[100].z);
//geomの座標の組み合わせを参照する場合
//	printProperties(geom.faces[0]);
//同じく、座標番号の頂点を知りたい場合　a,b,c,dのいずれか
//	console.log(geom.faces[0].a);
//	printProperties(geom.faces[0]);
	return mesh;
}

//結果を置換表示する関数
var outResult = function(result){
	var p = document.createElement('p');
	p.innerHTML = result;

	//hogeオブジェクトを取得し、挿入もしくは置換する
	var hoge = document.getElementById('rsuOut');
	if(hoge.innerHTML == ""){
		hoge.appendChild(p);
	} else {
		hoge.replaceChild(p, hoge.lastChild);
	}
}
//座標と三つの角度を受け取り，回転後の座標配列を返す関数
function V3rote( x , y , z , angX , angY , angZ ){
	var newX , newY , newZ ;
	//X軸回転 xは変化しない
	newY = y * Math.cos(angX) - z * Math.sin(angX) ;
	newZ = y * Math.sin(angX) + z * Math.cos(angX) ;
	y = newY ; z = newZ ;
	//Y軸回転 yは変化しない
	newX = x * Math.cos(angY) + z * Math.sin(angY) ;
	newZ = ( - x ) * Math.sin(angY) + z * Math.cos(angY) ;
	x = newX ; z = newZ ;
	//Z軸回転 zは変化しない
	newX = x * Math.cos(angZ) - y * Math.sin(angZ) ;
	newY = x * Math.sin(angZ) + y * Math.cos(angZ) ;
	x = newX ; y = newY ;
	//結果を配列に格納し，返す
	var result = array[ x , y , z ];
	return result;
}

//円の外周のみをセットする関数
function setNomoveCircle( geom , r , CIR_num ){
	if( r != 0 ){
		//r = 1 - r ;
	//rが0以外なら値をセット
		for(var i = 0 ; i < CIR_num ; i++ ){
			var x = Math.sin( i * 2 * Math.PI / CIR_num ) * r ;
			var y = Math.cos( i * 2 * Math.PI / CIR_num ) * r ;
			geom.vertices.push( new THREE.Vector3( x , y , 0 ) ) ;
		}
		geom.vertices.push( new THREE.Vector3( 0 , r , 0 ) ) ;
	} else {
		//rが0＝表示する必要がない部分の場合の処理
		console.log('err\n');
	}
}

var NMCM_array = new Array(
	0.436594203	,0			 ,0				,
	0.278612717	,0.638150289 ,0				,
	0.204410517	,0.468193384 ,0.733672604	,
	0.545584046	,0			 ,0				,
	0.376597837	,0.690265487 ,0				,
	0.287537538	,0.527027027 ,0.763513514	,
	0.610451306	,0			 ,0				,
	0.442340792	,0.724612737 ,0				,
	0.347297297	,0.568918919 ,0.785135135	,
	0.653688525	,0			 ,0				,
	0.490015361	,0.749615975 ,0				,
	0.393341554	,0.601726264 ,0.8027127		//3*12 = 36個の配列
);

function ptrNumBut( newPra , praC , praL , scene , nomoveCirArr , nomoveLineArr , r , CIR_num , nomoveCirArrMesh , nomoveLineArrMesh ){
	newPra.length = 0;
	newPra.push( praL );
	newPra.push( praC );
	outResult( newPra );

	for(var i in nomoveCirArrMesh ){
		scene.remove( nomoveCirArrMesh[i] );
	}
	for(var i in nomoveLineArrMesh ){
		scene.remove( nomoveLineArrMesh[i] );
	}
	nomoveCirArrMesh.length = 0;
	nomoveLineArrMesh.length = 0;

	//ここにシーンと動いていない円の座標・描画設定を書き込む
	//praCが円縁の数 1は最外周のみが動かない 範囲は1～4
	//2からは配列の数値を使用し、動かない部分を追加で描く
	for( var i = 0 ; i <= praC - 2 ; i++ ){
		//上記の式をforループで回し、各nomoveCirのgeomに結果を突っ込み、sceneに追加する
		//console.log('test: ' + ( ( praC - 2 ) * 3 + i + praL * 9 ) + ' : ' + i + ' \n');
		//console.log('test\n');
		nomoveCirArr[i] = new THREE.Geometry();
		setNomoveCircle( nomoveCirArr[i] , r * NMCM_array[ ( praC - 2 ) * 3 + i + praL * 9 ] , CIR_num );
		nomoveCirArrMesh.push( new THREE.Line( nomoveCirArr[i] , new THREE.LineBasicMaterial( { color: 0x000000 , opacity: 1 , linewidth : 5 } ) ) );
		scene.add( nomoveCirArrMesh[i] );
	}/*
	for( var i = 0 ; i < praL ; i++ ){
		//動かないラインの数はpraLの数をそのまま使用する 範囲は0～3
		//console.log('hoge:' + i + '\n');
		console.log('hoge\n');
	}*/
	if( praL == 1 ){
		nomoveLineArr[0] = new THREE.Geometry();
		nomoveLineArr[0].vertices.push( new THREE.Vector3(r,0,0) );
		nomoveLineArr[0].vertices.push( new THREE.Vector3(-r,0,0) );
		nomoveLineArrMesh.push( new THREE.Line( nomoveLineArr[0] , new THREE.LineBasicMaterial( { color: 0x000000 , opacity: 1 , linewidth : 5 } ) ) );
		scene.add( nomoveLineArrMesh[0] );

	}else if( praL == 2 ){
		nomoveLineArr[0] = new THREE.Geometry();
		nomoveLineArr[0].vertices.push( new THREE.Vector3(Math.sqrt( r * r / 2 ) ,Math.sqrt( r * r / 2 ) , 0 ) );
		nomoveLineArr[0].vertices.push( new THREE.Vector3(-Math.sqrt( r * r / 2 ) ,-Math.sqrt( r * r / 2 ) , 0 ) );
		nomoveLineArrMesh.push( new THREE.Line( nomoveLineArr[0] , new THREE.LineBasicMaterial( { color: 0x000000 , opacity: 1 , linewidth : 5 } ) ) );
		scene.add( nomoveLineArrMesh[0] );

		nomoveLineArr[1] = new THREE.Geometry();
		nomoveLineArr[1].vertices.push( new THREE.Vector3(-Math.sqrt( r * r / 2 ) ,Math.sqrt( r * r / 2 ) , 0 ) );
		nomoveLineArr[1].vertices.push( new THREE.Vector3(Math.sqrt( r * r / 2 ) ,-Math.sqrt( r * r / 2 ) , 0 ) );
		nomoveLineArrMesh.push( new THREE.Line( nomoveLineArr[1] , new THREE.LineBasicMaterial( { color: 0x000000 , opacity: 1 , linewidth : 5 } ) ) );
		scene.add( nomoveLineArrMesh[1] );

	}else if( praL == 3 ){
		//1と2は座標が違うので要調整 
		nomoveLineArr[0] = new THREE.Geometry();
		nomoveLineArr[0].vertices.push( new THREE.Vector3(r,0,0) );
		nomoveLineArr[0].vertices.push( new THREE.Vector3(-r,0,0) );
		nomoveLineArrMesh.push( new THREE.Line( nomoveLineArr[0] , new THREE.LineBasicMaterial( { color: 0x000000 , opacity: 1 , linewidth : 5 } ) ) );
		scene.add( nomoveLineArrMesh[0] );

		nomoveLineArr[1] = new THREE.Geometry();
		nomoveLineArr[1].vertices.push( new THREE.Vector3(Math.sqrt( r * r / 2 ) ,Math.sqrt( r * r / 2 ) , 0 ) );
		nomoveLineArr[1].vertices.push( new THREE.Vector3(-Math.sqrt( r * r / 2 ) ,-Math.sqrt( r * r / 2 ) , 0 ) );
		nomoveLineArrMesh.push( new THREE.Line( nomoveLineArr[1] , new THREE.LineBasicMaterial( { color: 0x000000 , opacity: 1 , linewidth : 5 } ) ) );
		scene.add( nomoveLineArrMesh[1] );

		nomoveLineArr[2] = new THREE.Geometry();
		nomoveLineArr[2].vertices.push( new THREE.Vector3(-Math.sqrt( r * r / 2 ) ,Math.sqrt( r * r / 2 ) , 0 ) );
		nomoveLineArr[2].vertices.push( new THREE.Vector3(Math.sqrt( r * r / 2 ) ,-Math.sqrt( r * r / 2 ) , 0 ) );
		nomoveLineArrMesh.push( new THREE.Line( nomoveLineArr[2] , new THREE.LineBasicMaterial( { color: 0x000000 , opacity: 1 , linewidth : 5 } ) ) );
		scene.add( nomoveLineArrMesh[2] );

	}
}

function meshRota( rx , ry , rz , mesh ){
	//入力されたmeshをrx,ry,rz分だけ回転させる
	mesh.rotation.x = rx;
	mesh.rotation.y = ry;
	mesh.rotation.z = rz;
}