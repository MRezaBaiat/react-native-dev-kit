/** <ul>
 * <li>GoogleMapSample</li>
 * <li>com.android2ee.formation.librairies.google.map.utils.direction</li>
 * <li>12 sept. 2013</li>
 *
 * <li>======================================================</li>
 *
 * <li>Projet : Mathias Seguy Project</li>
 * <li>Produit par MSE.</li>
 *
 /**
 * <ul>
 * Android Tutorial, An <strong>Android2EE</strong>'s project.</br>
 * Produced by <strong>Dr. Mathias SEGUY</strong>.</br>
 * Delivered by <strong>http://android2ee.com/</strong></br>
 *  Belongs to <strong>Mathias Seguy</strong></br>
 ****************************************************************************************************************</br>
 * This code is free for any usage except training and can't be distribute.</br>
 * The distribution is reserved to the site <strong>http://android2ee.com</strong>.</br>
 * The intelectual property belongs to <strong>Mathias Seguy</strong>.</br>
 * <em>http://mathias-seguy.developpez.com/</em></br> </br>
 *
 * *****************************************************************************************************************</br>
 *  Ce code est libre de toute utilisation mais n'est pas distribuable.</br>
 *  Sa distribution est reservée au site <strong>http://android2ee.com</strong>.</br>
 *  Sa propriété intellectuelle appartient à <strong>Mathias Seguy</strong>.</br>
 *  <em>http://mathias-seguy.developpez.com/</em></br> </br>
 * *****************************************************************************************************************</br>
 */


import ArrayList from '../../objects/ArrayList';
import GDLegs from './GDLegs';
import GDLatLng from './GDLatLng';
import PolyLine from './PolyLine';

/**
 * @author Mathias Seguy (Android2EE)
 * @goals
 *        This class aims to define a GoogleDirection which is bound to the JSon structure
 *        returned by the webService :
 *        "http://maps.googleapis.com/maps/api/directions/json?" + "origin=" + start.latitude + ","
 *        + start.longitude + "&destination=" + end.latitude + "," + end.longitude
 *        + "&sensor=false&units=metric&mode=driving";
 */
export default class GDirection {

	/**
	 * A GDirection is a list of GDLegs
	 */
	legs : ArrayList<GDLegs>;

	/**
	 * The North East corner of the square enclosing the road
	 */
	northeast : GDLatLng;

	/**
	 * The South West corner of the square enclosing the road
	 */
	southwest : GDLatLng;

	/**
	 * Copyrights
	 */
	copyrights : String;

	overview_polyline : PolyLine;

	summary : String;

	warnings : ArrayList<String>;

	waypoint_order : ArrayList<String>;

}
