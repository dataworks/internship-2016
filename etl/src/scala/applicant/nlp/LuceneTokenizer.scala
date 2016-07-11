package applicant.nlp

import java.io.StringReader
import org.apache.lucene.analysis.Analyzer
import org.apache.lucene.analysis.en.EnglishAnalyzer
import org.apache.lucene.analysis.standard.StandardAnalyzer
import org.apache.lucene.analysis.tokenattributes.CharTermAttribute
import scala.collection.mutable.ListBuffer

/**
 * Tokenizes text using Lucene Analyzers.
 */
class LuceneTokenizer(analyzer: String = null) {
    /**
     * Tokenizes a String.
     *
     * @param string input string
     * @return Seq[String]
     */
    def tokenize(string: String): Seq[String] = {
        var result = new ListBuffer[String]()
        var stream = getAnalyzer().tokenStream(null, new StringReader(string))
        stream.reset()
        while (stream.incrementToken()) {
            result += stream.getAttribute(classOf[CharTermAttribute]).toString()
        }

        return result
    }

    private def getAnalyzer(): Analyzer = {
        return if (analyzer == "english") new EnglishAnalyzer() else new StandardAnalyzer()
    }
}

/**
 * A class with
 */
object LuceneTokenizer {
  def getTokens(tokenString: String): Iterator[Seq[String]] = {
    val tokenizer = new LuceneTokenizer("english")
    var terms = tokenizer.tokenize(tokenString).filter { term =>
        term.length() > 2 && !term.matches("\\d+")
    }

    return terms.grouped(10)
  }
}
