package applicant.etl

import applicant.nlp._

import scala.collection.mutable.{ListBuffer, Map, LinkedHashSet}

/**
 *@author Brantley
 *
 *@version 0.0.1
 *
 */

object EntityMapper {
  def createMap(taggedEntities: LinkedHashSet[(String, String)], applicantID: String, fullText: String): Map[String, Object] = {
    var name, score, recentTitle, recentLocation, recentOrganization, degree, school, gpa, url, email, phone: String = "not found"
    val languageList: ListBuffer[String] = new ListBuffer[String]()
    val etlList: ListBuffer[String] = new ListBuffer[String]()
    val databaseList: ListBuffer[String] = new ListBuffer[String]()
    val webappList: ListBuffer[String] = new ListBuffer[String]()
    val mobileList: ListBuffer[String] = new ListBuffer[String]()
    val infoList: ListBuffer[Map[String, Object]] = new ListBuffer[Map[String, Object]]()

    //For now we set score manually
    score = "0.0"

    //degree, location, organization, person, school, title, bigdata, database, etl, webapp, mobile, language, gpa, email, phone, url

    taggedEntities.foreach { pair =>
      pair match {
        case ("degree", _) if (degree == "not found") => degree = pair._2
        case ("location", _) if (recentLocation == "not found") => recentLocation = pair._2
        case ("organization", _) if (recentOrganization == "not found") => recentOrganization = pair._2
        case ("person", _) if (name == "not found") => name = pair._2
      }
    }

    val map: Map[String, Object] = Map(
      "id" -> applicantID,
      "name" -> name,
      "score" -> score,
      "currentLocation" -> Map(
        "title" -> recentTitle,
        "location" -> recentLocation,
        "organization" -> recentOrganization
      ),
      "skills" -> Map(
          "langage" -> languageList,
          "etl" -> etlList,
          "database" -> databaseList,
          "webapp" -> webappList,
          "mobile" -> mobileList
      ),
      "education" -> Map(
        "degree" -> degree,
        "school" -> school,
        "gpa" -> gpa
      ),
      "contact" -> Map(
        "url" -> url,
        "email" -> email,
        "phone" -> phone
      ),
      "additionalInfo" -> infoList
    )

    return map
  }
}
