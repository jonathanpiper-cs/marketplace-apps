import { useCallback, useState, useEffect } from "react"
import localeTexts from "../../common/locales/en-us/index"
import parse from "html-react-parser"
import { useAppConfig } from "../../common/hooks/useAppConfig"
import type { Entry } from "@contentstack/app-sdk/dist/src/types/entry.types"
import "../index.css"
import styles from "./FieldModifier.module.css"
import Icon from "../../assets/Field-Modifier-Icon.svg"
import ReadOnly from "../../assets/lock.svg"
import JsonView from "../../assets/JsonView.svg"
import RawConfigModal from "../../components/ConfigModal/ConfigModal"
import ContentstackAppSDK from "@contentstack/app-sdk"
import { createDiffieHellmanGroup } from "crypto"
import { set } from "lodash"

const FieldModifierExtension = () => {
    const [category, setCategory] = useState<string | null>(null)
    const [fieldModifier, setFieldModifier]: any = useState<any>()
    const [isPrepended, setIsPrepended] = useState<boolean>(false)

    useEffect(() => {
        ContentstackAppSDK.init().then(async (appSDK: any) => {
            const fm = await appSDK.location.FieldModifierLocation
            setFieldModifier(fm)
            fm.frame.enableAutoResizing()
            const { category } = await fm.entry.getDraftData()
            if (fm.field.getData().indexOf(category) === 0) {
                setIsPrepended(true)
            }
            setCategory(category)
        })
    }, [])

    const prependCategory = useCallback(() => {
        if (fieldModifier && category) {
            const fieldData = fieldModifier.field.getData() || ""
            fieldModifier.field.setData(`${category}${fieldData}`)
            setIsPrepended(true)
        }
    }, [fieldModifier, category])

    return (
        <div className={`layout-container ${styles.layoutContainer}`}>
            <div className={`ui-location-wrapper ${styles.uiLocationWrapper}`}>
                <div className="ui-location">
                    <div className={`ui-container ${styles.uiContainer}`} onClick={!isPrepended ? prependCategory : undefined} style={{ cursor: (category && !isPrepended) ? 'pointer' : 'not-allowed' }}>
                        {fieldModifier ? (isPrepended ? `Category is already prepended` : (category ? `Click to prepend the category '${category}' to the existing field value.` : `Select a category to prepend its value.`)) : `Loading...`}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FieldModifierExtension
