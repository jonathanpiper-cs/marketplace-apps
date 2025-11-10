import { useState, useEffect } from "react"
import { useCustomField } from "../../common/hooks/useCustomField"
import type { Entry } from "@contentstack/app-sdk/dist/src/types/entry.types"
import ContentstackAppSDK from "@contentstack/app-sdk"
import * as contentstack from '@contentstack/management'
import './CustomField.css'

const CustomFieldExtension = () => {

    const { customField, setFieldData }: any = useCustomField()
    const [success, setSuccess] = useState<boolean | null>(null)
    const client = contentstack.client()
    let taxonomy: any[] = []

    useEffect(() => {
        ContentstackAppSDK.init().then(async (appSDK: any) => {
            const cF = await appSDK.location.CustomField
            const entry: Entry = cF.entry

            const validateFields = async (entry: Entry, taxonomy: any) => {
                const { select, taxonomies } = await entry.getDraftData()
                if (select && taxonomies) {
                    const selectedTaxonomies = taxonomies.map((t: any) => { return { term_uid: t.term_uid, taxonomy_uid: t.taxonomy_uid, name: taxonomy.find((tax: any) => tax.uid === t.term_uid)?.name } }).filter((tag: any) => select.includes(tag.name))
                    if (selectedTaxonomies.length !== 0) setSuccess(true)
                    else setSuccess(false)
                } else setSuccess(null)
            }

            const fetchTaxonomy = async () => {
                const taxonomy = await client.stack({ api_key: import.meta.env.VITE_STACK_API_KEY, management_token: import.meta.env.VITE_MANAGEMENT_TOKEN }).taxonomy('my_test_taxonomy').terms().query({ depth: 5 }).find().then((result) => {
                    return result.items
                })
                return taxonomy
            }

            taxonomy = await fetchTaxonomy()

            validateFields(entry, taxonomy)

            entry.onChange(() => validateFields(entry, taxonomy))
            cF.frame.updateHeight(56)
        })
    }, [customField, taxonomy])

    return (
        <div className="layout-container">
            <div className="ui-location-wrapper">
                <div className="ui-location">
                    <div className="ui-container">
                        <div className="taxonomy-validator">
                            {success !== null ? (success === true ? <span className="success">'🎉 Valid Selection</span> : <span className="error">⚠️ Invalid Selection</span>) : 'No Selection'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CustomFieldExtension
