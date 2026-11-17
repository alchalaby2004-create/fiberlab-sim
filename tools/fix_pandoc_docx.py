# Post-process a pandoc .docx so it passes OOXML schema validation (element order, nsid length).
import sys, zipfile, shutil, re
from lxml import etree
W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"; MM = "http://schemas.openxmlformats.org/officeDocument/2006/math"
q = lambda ns, t: "{%s}%s" % (ns, t)
ORD = {
 q(W, "style"): ["name", "aliases", "basedOn", "next", "link", "autoRedefine", "hidden", "uiPriority", "semiHidden", "unhideWhenUsed", "qFormat", "locked", "personal", "personalCompose", "personalReply", "rsid", "pPr", "rPr", "tblPr", "trPr", "tcPr", "tblStylePr"],
 q(W, "tcPr"): ["cnfStyle", "tcW", "gridSpan", "hMerge", "vMerge", "tcBorders", "shd", "noWrap", "tcMar", "textDirection", "tcFitText", "vAlign", "hideMark"],
 q(W, "pPr"): ["pStyle","keepNext","keepLines","pageBreakBefore","framePr","widowControl","numPr","suppressLineNumbers","pBdr","shd","tabs","suppressAutoHyphens","kinsoku","wordWrap","overflowPunct","topLinePunct","autoSpaceDE","autoSpaceDN","bidi","adjustRightInd","snapToGrid","spacing","ind","contextualSpacing","mirrorIndents","suppressOverlap","jc","textDirection","textAlignment","textboxTightWrap","outlineLvl","divId","cnfStyle","rPr","sectPr","pPrChange"],
 q(W, "tblPr"): ["tblStyle","tblpPr","tblOverlap","bidiVisual","tblStyleRowBandSize","tblStyleColBandSize","tblW","jc","tblCellSpacing","tblInd","tblBorders","shd","tblLayout","tblCellMar","tblLook","tblCaption","tblDescription","tblPrChange"],
 q(W, "settings"): ['writeProtection', 'view', 'zoom', 'removePersonalInformation', 'removeDateAndTime', 'doNotDisplayPageBoundaries', 'displayBackgroundShape', 'printPostScriptOverText', 'printFractionalCharacterWidth', 'printFormsData', 'embedTrueTypeFonts', 'embedSystemFonts', 'saveSubsetFonts', 'saveFormsData', 'mirrorMargins', 'alignBordersAndEdges', 'bordersDoNotSurroundHeader', 'bordersDoNotSurroundFooter', 'gutterAtTop', 'hideSpellingErrors', 'hideGrammaticalErrors', 'activeWritingStyle', 'proofState', 'formsDesign', 'attachedTemplate', 'linkStyles', 'stylePaneFormatFilter', 'stylePaneSortMethod', 'documentType', 'mailMerge', 'revisionView', 'trackRevisions', 'doNotTrackMoves', 'doNotTrackFormatting', 'documentProtection', 'autoFormatOverride', 'styleLockTheme', 'styleLockQFSet', 'defaultTabStop', 'autoHyphenation', 'consecutiveHyphenLimit', 'hyphenationZone', 'doNotHyphenateCaps', 'showEnvelope', 'summaryLength', 'clickAndTypeStyle', 'defaultTableStyle', 'evenAndOddHeaders', 'bookFoldRevPrinting', 'bookFoldPrinting', 'bookFoldPrintingSheets', 'drawingGridHorizontalSpacing', 'drawingGridVerticalSpacing', 'displayHorizontalDrawingGridEvery', 'displayVerticalDrawingGridEvery', 'doNotUseMarginsForDrawingGridOrigin', 'drawingGridHorizontalOrigin', 'drawingGridVerticalOrigin', 'doNotShadeFormData', 'noPunctuationKerning', 'characterSpacingControl', 'printTwoOnOne', 'strictFirstAndLastChars', 'noLineBreaksAfter', 'noLineBreaksBefore', 'savePreviewPicture', 'doNotValidateAgainstSchema', 'saveInvalidXml', 'ignoreMixedContent', 'alwaysShowPlaceholderText', 'doNotDemarcateInvalidXml', 'saveXmlDataOnly', 'useXSLTWhenSaving', 'saveThroughXslt', 'showXMLTags', 'alwaysMergeEmptyNamespace', 'updateFields', 'hdrShapeDefaults', 'footnotePr', 'endnotePr', 'compat', 'docVars', 'rsids', 'mathPr', 'attachedSchema', 'themeFontLang', 'clrSchemeMapping', 'doNotIncludeSubdocsInStats', 'doNotAutoCompressPictures', 'forceUpgrade', 'captions', 'readModeInkLockDown', 'smartTagType', 'schemaLibrary', 'shapeDefaults', 'doNotEmbedSmartTags', 'decimalSymbol', 'listSeparator'],
 q(MM, "dPr"): ["begChr", "sepChr", "endChr", "grow", "shp", "ctrlPr"],
}
def reorder(root):
    for tag, order in ORD.items():
        ns = tag[1:].split("}")[0]
        for el in root.iter(tag):
            kids = list(el)
            known = [k for k in kids if isinstance(k.tag, str) and k.tag.startswith("{" + ns + "}") and k.tag.split("}")[1] in order]
            bad = [k for k in kids if isinstance(k.tag, str) and k.tag.startswith("{" + ns + "}") and k.tag.split("}")[1] not in order]
            for k in bad: el.remove(k)  # elements not allowed here
            for k in known: el.remove(k)
            for k in sorted(known, key=lambda k: order.index(k.tag.split("}")[1])): el.append(k)
    return root
src = sys.argv[1]; tmp = src + ".tmp"
with zipfile.ZipFile(src) as zin, zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zout:
    for it in zin.infolist():
        data = zin.read(it.filename)
        if it.filename in ("word/styles.xml", "word/document.xml"):
            root = reorder(etree.fromstring(data))
            for el in root.iter():
                if el.tail and el.tail.strip(): el.tail = "\n"
            data = etree.tostring(root, xml_declaration=True, encoding="UTF-8", standalone=True)
        if it.filename == "word/settings.xml":
            root = etree.fromstring(data); tag = root.tag; order = ORD[tag]
            kids = [k for k in root if isinstance(k.tag, str)]
            for k in kids: root.remove(k)
            for k in sorted(kids, key=lambda k: order.index(k.tag.split("}")[1]) if k.tag.split("}")[1] in order else 999): root.append(k)
            data = etree.tostring(root, xml_declaration=True, encoding="UTF-8", standalone=True)
        if it.filename == "word/numbering.xml":
            s = data.decode("utf8"); s = re.sub(r'(w:nsid w:val=")([0-9A-Fa-f]+)(")', lambda m: m.group(1) + m.group(2).upper().rjust(8, "0")[-8:] + m.group(3), s); data = s.encode("utf8")
        if it.filename == "[Content_Types].xml":
            t = data.decode("utf8")
            for ext, ct in (("png", "image/png"), ("jpeg", "image/jpeg"), ("jpg", "image/jpeg")):
                if 'Extension="%s"' % ext not in t: t = t.replace("<Types ", "<Types ", 1).replace(">", '><Default Extension="%s" ContentType="%s"/>' % (ext, ct), 1) if t.startswith("<?xml") is False else t.replace("?>", "?>", 1)
            if 'Extension="png"' not in t:
                i = t.index(">", t.index("<Types")) + 1
                t = t[:i] + '<Default Extension="png" ContentType="image/png"/><Default Extension="jpeg" ContentType="image/jpeg"/>' + t[i:]
            data = t.encode("utf8")
        if it.filename.endswith("/"): continue
        zout.writestr(it, data)
shutil.move(tmp, src)
