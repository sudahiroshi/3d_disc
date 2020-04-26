//グローバル変数
//変化の最大幅
var MAX_h = 10;
//ベッセル関数の根
var bes_MN = new Array(
	 2.405 ,  3.832 ,  5.135 ,  6.379 ,
	 5.521 ,  7.016 ,  8.417 ,  9.76  ,
	 8.654 , 10.173 , 11.62  , 13.017 ,
	11.792 , 13.323 , 14.796 , 16.224 );
//ベッセル関数を求める関数本体は、functionsに記述
//bessel(N,X) return BE

//円の半径の長さに関するパラメータ変更・・・？
//console.log(bes_MN[4] + '\n');
//Z軸を算出する関数
function calcZVec( r , t , r_max , ar , LNPra , ang ){
	var at,l,lll;
	l = 10 ;
	lll = Math.sin( Math.PI / 180 * ( t + 0.5 ) );
	at = Math.cos( ang * LNPra );
	return ar * at * l * lll ;
}
//x,y座標から角度を得る
//console.log( Math.atan2( x , y ) * 180 / Math.PI + '\n' );

//geomをセットする関数
//r_max 半径の最大長 CIC_num 円の中の円の数 CIR_num 放射線の数
//SR_num 基準円(zが常に0の円)の数 PL_num 放射線区切りの数 t 時間
function setCircleVec3( geom , r_max , CIC_num , CIR_num , LNPra , CNPra , t){
	//console.log( (CNPra - 1) * 4 + LNPra + '\n' );
	//console.log( CNPra + ':' + LNPra + '\n' );
	//頂点は後で法線出しやすいように、時計回り, 反時計回りどちらかに統一しておく
	//全てgeomに登録、頂点を代入する順番さえ変えなければ、faceの座標番号は同じとなる
	//エラー処理
	if(r_max < 1){
		console.log('r_maxは1以上を指定してください\n');
		return ;
	}
	if(CIC_num < 0){
		console.log('CIC_numは0以上を指定してください\n');
		return ;
	}
	if(CIR_num < 1){
		console.log('CIR_numは1以上を指定してください\n');
		return ;
	}
	//誤差修正の為、CIC_numを1加算
	CIC_num++;
	//ほぼ共通で使用する変数の算出
	//100を円の最大半径、Iを現時点での半径として変更
	var bes_R = bes_MN[ (CNPra - 1) * 4 + LNPra ];
	//console.log( bes_R + '\n' );

	if(geom.vertices.length == 0){
	//初回の呼び出し時はこちらの座標登録処理を行う
		console.log('first\n');
		var vec3num = CIC_num * CIR_num + 1;	//中心点（Ｏ）分の+1
		//	console.log('all vec3 nums = ' + vec3num + '\n');
		//座標を算出し、geomに挿入していく
		//円の中心点を先に代入
		var z = calcZVec( 0 , t , r_max , bessel( LNPra , bes_R )  , LNPra , null );
		geom.vertices.push( new THREE.Vector3( 0 , 0 , z ) );
		for(var i = 0 ; i < CIR_num ; i++ ){
			for (var j = 1 ; j <= CIC_num ; j++ ){
				/*console.log( i + ',' + j + ':' + 
					Math.sin( i * 2 * Math.PI / CIR_num ) * r_max + ',' + 
					Math.cos( i * 2 * Math.PI / CIR_num ) * r_max / CIC_num * j + '\n' );*/
				var x = Math.sin( i * 2 * Math.PI / CIR_num ) * r_max / CIC_num * j ;	//Vector3のx
				var y = Math.cos( i * 2 * Math.PI / CIR_num ) * r_max / CIC_num * j ;	//Vector3のy
				var r = Math.sqrt( Math.pow( x , 2 ) + Math.pow( y , 2 ) );				//このxy地点での半径
				//角度の算出
				var ang = Math.atan2( x , y )	//本来は/180だが，移植元に合わせて/90に
				var bes = bessel( LNPra , bes_R * ( r_max - r ) / r_max );
				var z = calcZVec( r , t , r_max , bes , LNPra , ang );			//Vector3のz
				geom.vertices.push( new THREE.Vector3( x , y , z ) );
			}
		}
	}
	else{
	//二回目以降は、こちらの座標変更処理を行う
	//XとYの座標は変わらないので、Zのみ変更する
		var vec3num = CIC_num * CIR_num + 1;	//中心点（Ｏ）分の+1
		//座標を算出し、geomに挿入していく
		//円の中心点を先に代入
		var z = Math.sin( Math.PI * 2 * t / 360 ) * Math.sin( Math.PI / r_max / 2 * r_max );
		z = calcZVec( 0 , t , r_max , bessel( LNPra , bes_R )  , LNPra , null );
		geom.vertices[0].setZ( z ) ;
		for(var i = 1 ; i <= CIR_num * CIC_num ; i++ ){
			var r = Math.sqrt( Math.pow( geom.vertices[i].x , 2 ) + 
						Math.pow( geom.vertices[i].y , 2 ) );				//このxy地点での半径
			var ang = Math.atan2( geom.vertices[i].x , geom.vertices[i].y ) ;	//同じく角度
			var bes = bessel( LNPra , bes_R * ( r_max - r ) / r_max );
			z = calcZVec( r , t , r_max , bes , LNPra , ang );	//Vector3のz
			geom.vertices[i].setZ( z );
		}
	}

	//代入した座標を使い、ポリゴンを描画
	//円が一重のとき 書き換えをしていません
	if( CIC_num == 1 ){
		var i;
		for( i = 1 ; i < CIR_num ; i++ ){
			geom.faces.push( new THREE.Face3( 0 , i , i + 1 ) );
		}
		geom.faces.push( new THREE.Face3( 0, i , 1 ));
	}
	else {
		var i , next_i , n , color , p1 , p2 , p3 , p4 , pa ;
		for( i = 1 ; i < ( CIC_num * ( CIR_num ) ) ; i += CIC_num ){
			next_i = i + CIC_num;
			if( ( CIC_num * ( CIR_num ) ) < next_i )
				next_i = 1;
			//色変換系列の前準備
			p1 = geom.vertices[0].z ;
			p2 = geom.vertices[i].z ;
			p3 = geom.vertices[next_i].z ;
			pa = ( p1 + p2 + p3 ) / 3 / MAX_h ;
//			console.log('pa:' + Math.round( pa / 10 * 0x008800 ) + '\n');
//			console.log('pa:' + 0x008800 + '\n');
//			console.log('pa:' + (0x008800 + Math.round( pa * 0x008800 ) )  + '\n');
			//console.log(temp.toString(16) + '\n');
			color = new THREE.Color( 0xFF7777 + Math.round( pa * 0x77 ) * 0x100 - Math.round( pa * 0x77 ));
			//printProperties(color);
			//頂点情報と同時に、色情報を入れる
			n = geom.faces.push( new THREE.Face3( 0 , i , next_i , null , color ) );
			for(var j = 0 ; j < CIC_num - 1 ; j++ ){
				//色変換系列の前準備
				p1 = geom.vertices[i + j].z ;
				p2 = geom.vertices[i + j + 1].z ;
				p3 = geom.vertices[next_i + j + 1].z ;
				p4 = geom.vertices[next_i + j].z ;
				pa = ( p1 + p2 + p3 + p4 ) / 4 / MAX_h ;
				color = new THREE.Color( 0xFF7777 + Math.round( pa * 0x77 ) * 0x100 - Math.round( pa * 0x77 ));
				//頂点情報と同時に、色情報を入れる
				n = geom.faces.push( new THREE.Face4( i + j , i + j + 1 , next_i + j + 1 , next_i + j , null , color) );
			}
		}
	}
	//法線ベクトル等の自動計算
	geom.computeFaceNormals();
}
