function main(){
/*----------------------------------------
/----------送受信するパラメータ----------/
----------------------------------------*/
//最初に一度だけ送信
	//再レンダリング関数で使用する変数
	//tに最後に呼び出された時刻を代入
	var t = 0 , t_now , t_last  = new Date().getTime();
	var t_first = t_last;	//同期用にアニメーション開始時間を記憶

//変化があるたびに再送信
	var CNPra = 1;	//パラメータ1
	var LNPra = 0;	//パラメータ2
	var tPower = 1;	//パラメータ3 時間倍率
	//3D図形の回転角度
	var meshRotateX = 210, meshRotateY = 0 , meshRotateZ = 157;

/*----------------------------------------
/----------------ここまで----------------/
----------------------------------------*/

	//ドラッグでの回転を行う際に使用する
	var clickPosX, clickPosY, mouseMoveX, mouseMoveY, mouseDownFlag = false;

	var newPra = new Array( 0 , 1 ) ;
	var r_max = 32 ;

	var cvX = 300 , cvY = 150 ;//ブラウザ左上からキャンバス左上までの距離
	//画面の横幅と縦幅の値の設定
	var width = 600;
	var height = 600;

	//ページエレメントの初期設定
	domElemInit();

	var CIC_number = 50 ;
	var CIR_number = 50 ;

	//移動しない線の保存先
	var nomoveCirArr = Array( new THREE.Geometry() , new THREE.Geometry() , new THREE.Geometry() );
	var nomoveLineArr = Array( new THREE.Geometry() , new THREE.Geometry() , new THREE.Geometry() );
	var nomoveCirArrMesh = Array();
	var nomoveLineArrMesh = Array();

	//FPSを表示する処理
	var stats;
	// set stats
	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
	stats.domElement.style.zIndex = 100;
	document.body.appendChild(stats.domElement);

	//シーンの生成
	var scene = new THREE.Scene();
	
	//カメラを生成し、シーンに追加
	var camera = new THREE.PerspectiveCamera( 40, width / height, 1, 1000 );
	camera.position.z = 180;
	scene.add( camera );
	
	//レンダラーを生成
	var renderer = new THREE.WebGLRenderer();
	renderer.setSize( width, height );
	document.getElementById('CVThree').appendChild( renderer.domElement );
	
	//光源を作成　今回は平行光源を、少し斜めから使用
	var directionalLight = new THREE.DirectionalLight( 0xffffff, 3);	//色,強さ
	directionalLight.position.z = 3;	//ここで傾けている
	//作成した光源をシーンに追加
	scene.add(directionalLight);

	//ジオメトリgeomの作成
	var geom = new THREE.Geometry();
	//自動計算設定1
	//こちらは複数回呼び出すとエラーを吐くため、こちらに配置
	geom.computeVertexNormals();

	//ジオメトリの設定
//	setCircleVec3( geom , r_max , CIC_num 	, CIR_num 	, LNPra , CNPra	,t	);
	setCircleVec3( geom , r_max	, CIC_number, CIR_number, LNPra , CNPra	,0  );

	//ラインのサンプル
	//線は決め打ちOK
	//元シミュ右上の画像と揺れていない線を，もっと大きなキャンバスでつなげる
	//つながった線も同様
/*
	nomoveLineArr[0] = new THREE.Geometry();
	//setNomoveCircle( geom		, r				, CIR_num )
	  setNomoveCircle( nomoveLineArr[0]	, r_max * 0.204410517	, CIR_number );
	//lineGeom.vertices[0].set( 40 , 40 , 0 );	//先頭を変更する際は、この方法を使用すること

	var line = new THREE.Line( nomoveLineArr[0] , new THREE.LineBasicMaterial( { color: 0x000000 , opacity: 1 , linewidth : 5 } ) );

	scene.add( line );
*/
	//meshを設定し、シーンに追加
	var mesh = AutoMeshSetter( geom );
	scene.add( mesh );

	//レンダリング
	renderer.render( scene, camera );

	//アニメーションレンダリング設定
	function rendering(){
		//パラメータの更新チェック
		if( newPra[0] != LNPra || newPra[1] != CNPra ){
			LNPra = newPra[0];
			CNPra = newPra[1];
		}
		//tに進んだ時間差分/8を加算し、1800で割った余りを代入
		//1800の理由は、スロー再生時にその値でなければ正常に動かないため
		t_now = new Date().getTime();
		t = ( ( t + ( t_now - t_last ) / 8 ) ) % 1800 ;
		t_last = t_now ;

		//geomとsceneの再定義
		//geom = new THREE.Geometry();
		//geomから消す必要のあるものを削除

		//faces.length これを行わないと処理が非常に重くなる
		geom.faces.length = 0;
		//geometryGroups なぜかこれを消さないとアニメーションしない
		delete geom.geometryGroups ;

		//vertices 現在はこれを初期化することで、座標設定の定義し直しとなる
		//geom.vertices.length = 0;

		scene.remove( mesh );

		//座標の再設定
//		setCircleVec3( geom , r_max , CIC_num 	, CIR_num 	, LNPra , CNPra	,t	);
		setCircleVec3( geom , r_max	, CIC_number, CIR_number, LNPra , CNPra	, ( t * tPower ) % 360 );
		//meshの再設定
		mesh = AutoMeshSetter(geom)

		//下方の関数で変化させられた回転角の設定
		meshRota( meshRotateX , meshRotateY , meshRotateZ , mesh );
		//meshRota( meshRotateX , meshRotateY , meshRotateZ , line );
		for( var i in nomoveCirArrMesh ){
			meshRota( meshRotateX , meshRotateY , meshRotateZ , nomoveCirArrMesh[i] );
		}
		for( var i in nomoveLineArrMesh ){
			meshRota( meshRotateX , meshRotateY , meshRotateZ , nomoveLineArrMesh[i] );
		}

		scene.add( mesh );

		//再描画
		renderer.render(scene, camera);
        stats.update();

		//30カウント後にこの関数を再び呼び出す
		setTimeout(rendering, 30);

		//以降、この関数をループ
	}

	//ドラッグでの回転処理
	function MouseMoveFunc(e){
		// クライアント座標系を基点としたマウスカーソルの座標を取得
		mouseMoveX = e.clientX;
		mouseMoveY = e.clientY;

		//フラグが立っているか
		if(mouseDownFlag == true){
			//フラグが立っている場合、動いた差/100で物体を回転させる
			meshRotateX = ( meshRotateX + (mouseMoveY - clickPosY) / 100.0 ) % 6.28;
			meshRotateY = ( meshRotateY + (mouseMoveX - clickPosX) / 100.0 ) % 6.28;
			mesh.rotation.x = meshRotateX;
			mesh.rotation.y = meshRotateY;
			document.getElementById('vecX').value = ( meshRotateX * 100 + 628 ) % 628;
			document.getElementById('vecY').value = ( meshRotateY * 100 + 628 ) % 628;
			document.getElementById('two').innerHTML = document.getElementById('vecX').value;
			document.getElementById('three').innerHTML = document.getElementById('vecY').value;
			//その後、現在の位置を更新
			clickPosX = mouseMoveX;
			clickPosY = mouseMoveY;
			//再描画
			renderer.render(scene, camera);
		}
	}
	//上記のイベントを追加
	document.addEventListener("mousemove" , MouseMoveFunc);

	//現在は右クリックドラッグでも動作するようになっている
	//動作タイミングはボタンを押した瞬間かつcanvas内
	document.onmousedown = function(e){
		//座標の取得
		clickPosX = e.clientX;
		clickPosY = e.clientY;
		//座標位置の確認
		if((( cvX < clickPosX ) && (clickPosX < cvX + width )) &&
			((cvY < clickPosY ) && (clickPosY < cvY + height - 150 ))){
			//初期座標を書き込み、フラグを立てる
			clickPosX = mouseMoveX;
			clickPosY = mouseMoveY;
			mouseDownFlag = true;
		}
		//console.log('X:' + clickPosX + '  Y:' + clickPosY + '\n');
	}

	//動作タイミングはボタンを離した瞬間
	document.onmouseup = function(e){
		//フラグを折る
		mouseDownFlag = false;
	}

	//スライダーなどの一括設定
	function domElemInit(){
				//スライダ－表示のための設定
		document.getElementById('time').onchange = function() {
			//値を表示する
			document.getElementById('one').innerHTML = ( ( this.value / 5 ) + '倍速' );
			tPower = this.value / 5 ;
		};
		document.getElementById('time').onchange();
		document.getElementById('vecX').onchange = function() {
			//値を表示する
			if( this.value == 314 ){
				document.getElementById('two').innerHTML = 'π';
			} else if( this.value == 628 ){
				document.getElementById('two').innerHTML = '2π';
			} else if( this.value == 157 ){
				document.getElementById('two').innerHTML = 'π/2';
			} else if( this.value == 471 ){
				document.getElementById('two').innerHTML = '3π/2';
			} else {
				document.getElementById('two').innerHTML = this.value / 100;
			}
			meshRotateX = this.value / 100;
		};
		document.getElementById('vecX').onchange();
		document.getElementById('vecY').onchange = function() {
			//値を表示する
			if( this.value == 314 ){
				document.getElementById('three').innerHTML = 'π';
			} else if( this.value == 628 ){
				document.getElementById('three').innerHTML = '2π';
			} else if( this.value == 157 ){
				document.getElementById('three').innerHTML = 'π/2';
			} else if( this.value == 471 ){
				document.getElementById('three').innerHTML = '3π/2';
			} else {
				document.getElementById('three').innerHTML = this.value / 100;
			}
			meshRotateY = this.value / 100;
		};
		document.getElementById('vecY').onchange();
		document.getElementById('vecZ').onchange = function() {
			//値を表示する
			if( this.value == 314 ){
				document.getElementById('four').innerHTML = 'π';
			} else if( this.value == 628 ){
				document.getElementById('four').innerHTML = '2π';
			} else if( this.value == 157 ){
				document.getElementById('four').innerHTML = 'π/2';
			} else if( this.value == 471 ){
				document.getElementById('four').innerHTML = '3π/2';
			} else {
				document.getElementById('four').innerHTML = this.value / 100;
			}
			meshRotateZ = this.value / 100;
		};
		document.getElementById('vecZ').onchange();
		//値の取得方法
		document.getElementById('mmm').innerHTML =
		['min: ' + document.getElementById('time').min,
		 'max: ' + document.getElementById('time').max].join(', ');
		//ボタンに対するイベント設定
		document.formOne.Num10.addEventListener('click', function(){ ptrNumBut( newPra , 1 , 0 , scene , nomoveCirArr , nomoveLineArr , r_max , CIR_number , nomoveCirArrMesh , nomoveLineArrMesh ); } );
		document.formOne.Num20.addEventListener('click', function(){ ptrNumBut( newPra , 2 , 0 , scene , nomoveCirArr , nomoveLineArr , r_max , CIR_number , nomoveCirArrMesh , nomoveLineArrMesh ); } );
		document.formOne.Num30.addEventListener('click', function(){ ptrNumBut( newPra , 3 , 0 , scene , nomoveCirArr , nomoveLineArr , r_max , CIR_number , nomoveCirArrMesh , nomoveLineArrMesh ); } );
		document.formOne.Num40.addEventListener('click', function(){ ptrNumBut( newPra , 4 , 0 , scene , nomoveCirArr , nomoveLineArr , r_max , CIR_number , nomoveCirArrMesh , nomoveLineArrMesh ); } );
		document.formOne.Num11.addEventListener('click', function(){ ptrNumBut( newPra , 1 , 1 , scene , nomoveCirArr , nomoveLineArr , r_max , CIR_number , nomoveCirArrMesh , nomoveLineArrMesh ); } );
		document.formOne.Num21.addEventListener('click', function(){ ptrNumBut( newPra , 2 , 1 , scene , nomoveCirArr , nomoveLineArr , r_max , CIR_number , nomoveCirArrMesh , nomoveLineArrMesh ); } );
		document.formOne.Num31.addEventListener('click', function(){ ptrNumBut( newPra , 3 , 1 , scene , nomoveCirArr , nomoveLineArr , r_max , CIR_number , nomoveCirArrMesh , nomoveLineArrMesh ); } );
		document.formOne.Num41.addEventListener('click', function(){ ptrNumBut( newPra , 4 , 1 , scene , nomoveCirArr , nomoveLineArr , r_max , CIR_number , nomoveCirArrMesh , nomoveLineArrMesh ); } );
		document.formOne.Num12.addEventListener('click', function(){ ptrNumBut( newPra , 1 , 2 , scene , nomoveCirArr , nomoveLineArr , r_max , CIR_number , nomoveCirArrMesh , nomoveLineArrMesh ); } );
		document.formOne.Num22.addEventListener('click', function(){ ptrNumBut( newPra , 2 , 2 , scene , nomoveCirArr , nomoveLineArr , r_max , CIR_number , nomoveCirArrMesh , nomoveLineArrMesh ); } );
		document.formOne.Num32.addEventListener('click', function(){ ptrNumBut( newPra , 3 , 2 , scene , nomoveCirArr , nomoveLineArr , r_max , CIR_number , nomoveCirArrMesh , nomoveLineArrMesh ); } );
		document.formOne.Num42.addEventListener('click', function(){ ptrNumBut( newPra , 4 , 2 , scene , nomoveCirArr , nomoveLineArr , r_max , CIR_number , nomoveCirArrMesh , nomoveLineArrMesh ); } );
		document.formOne.Num13.addEventListener('click', function(){ ptrNumBut( newPra , 1 , 3 , scene , nomoveCirArr , nomoveLineArr , r_max , CIR_number , nomoveCirArrMesh , nomoveLineArrMesh ); } );
		document.formOne.Num23.addEventListener('click', function(){ ptrNumBut( newPra , 2 , 3 , scene , nomoveCirArr , nomoveLineArr , r_max , CIR_number , nomoveCirArrMesh , nomoveLineArrMesh ); } );
		document.formOne.Num33.addEventListener('click', function(){ ptrNumBut( newPra , 3 , 3 , scene , nomoveCirArr , nomoveLineArr , r_max , CIR_number , nomoveCirArrMesh , nomoveLineArrMesh ); } );
		document.formOne.Num43.addEventListener('click', function(){ ptrNumBut( newPra , 4 , 3 , scene , nomoveCirArr , nomoveLineArr , r_max , CIR_number , nomoveCirArrMesh , nomoveLineArrMesh ); } );
		document.formOne.initRote.addEventListener('click', function(){ 
				tPower = 1 ;
				meshRotateX = 2.10 ;
				meshRotateY = 0 ;
				meshRotateZ = 1.57 ;
				document.getElementById('time').value = 5;
				document.getElementById('vecX').value = 210;
				document.getElementById('vecY').value = 0;
				document.getElementById('vecZ').value = 157;
				document.getElementById('one').innerHTML = ( ( tPower ) + '倍速' );
				document.getElementById('two').innerHTML = document.getElementById('vecX').value / 100;
				document.getElementById('three').innerHTML = document.getElementById('vecY').value / 100;
				document.getElementById('four').innerHTML = document.getElementById('vecZ').value / 100; }
		 );
	}
	//関数スタート
	rendering();
}
//デバッグ用関数 オブジェクトの中身をすべて表示
function printProperties(obj) {
    var properties = '';
    for (var prop in obj){
        properties += prop + "=" + obj[prop] + "\n<br>";
    }
    document.write(properties);
}