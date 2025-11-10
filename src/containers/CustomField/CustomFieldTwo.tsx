import { useState, useEffect } from "react"
import { useCustomField } from "../../common/hooks/useCustomField"
import type { Entry } from "@contentstack/app-sdk/dist/src/types/entry.types"
import ContentstackAppSDK from "@contentstack/app-sdk"
import * as contentstack from '@contentstack/management'
// import { Radio } from '@contentstack/venus-components'
import './CustomField.css'
// import { set } from "lodash"

const CustomFieldExtension = () => {

    const { customField, setFieldData }: any = useCustomField()
    const [success, setSuccess] = useState<boolean | null>(null)
    // const [taxonomyTerms, setTaxonomyTerms] = useState<any[]>([])
    // const [errorMessage, setErrorMessage] = useState<string>('')
    const client = contentstack.client()
    // const [taxonomy, setTaxonomy] = useState<any[]>([])
    // const [setBy, setSetBy] = useState<string>('')
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

    // useEffect(() => {
    //     const fetchTaxonomy = async () => {
    //         const taxonomy = await client.stack({ api_key: import.meta.env.VITE_STACK_API_KEY, management_token: import.meta.env.VITE_MANAGEMENT_TOKEN }).taxonomy('my_test_taxonomy').terms().query({ depth: 5 }).find().then((result) => {
    //             return result.items
    //         })
    //         setTaxonomy(taxonomy)
    //     }
    //     fetchTaxonomy()
    // }, [])

    // useEffect(() => {
    //     console.log('Custom Field changed:', customField)
    //     const fieldValue = customField
    //     ContentstackAppSDK.init().then(async (appSDK: any) => {
    //         const cF = await appSDK.location.CustomField
    //         const entry: Entry = cF.entry

    //         const validateFields = async () => {
    //             const terms = await getTerms()
    //             setTaxonomyTerms(terms)
    //             if (setBy === 'validator' && fieldValue !== '' && (terms.find((term: any) => term.term_uid === fieldValue) === undefined)) {
    //                 setErrorMessage('⚠️ Selection is no longer valid.')
    //                 setFieldData('')
    //                 setSetBy('')
    //             } else if (setBy !== '') {
    //                 setErrorMessage('')
    //             }
    //         }

    //         const getTerms = async () => {
    //             const { taxonomies } = await entry.getDraftData()
    //             const terms = taxonomies.map((t: any) => { return { term_uid: t.term_uid, taxonomy_uid: t.taxonomy_uid, name: taxonomy.find((tax: any) => tax.uid === t.term_uid)?.name } })
    //             if (terms !== taxonomyTerms) {
    //                 setSetBy('validator')
    //             }
    //             return terms || []
    //         }

    //         setTaxonomyTerms(await getTerms())
    //         if (setBy === '') validateFields()
    //         entry.onChange(() => validateFields())
    //         entry.onSave(() => setSetBy('init'))
    //         cF.frame.updateHeight(20 + (taxonomyTerms.length * 28))
    //     })
    // }, [customField, taxonomy])

    // const radioChange = (e: any) => {
    //     console.log('Setting customField:', e.target.id)
    //     setFieldData(e.target.id)
    //     setErrorMessage('')
    //     setSetBy('radio')
    // }

    return (
        <div className="layout-container">
            <div className="ui-location-wrapper">
                <div className="ui-location">
                    <div className="ui-container">
                        <div className="taxonomy-validator">
                            {success !== null ? (success === true ? <span className="success">'🎉 Valid Selection</span> : <span className="error">⚠️ Invalid Selection</span>) : 'No Selection'}
                            {/* {errorMessage ? <span>{errorMessage}</span> : null}
                            {taxonomyTerms.length > 0 ? taxonomyTerms.map((term: any) => (
                                <Radio
                                    name="term"
                                    label={term.name}
                                    id={term.term_uid}
                                    onChange={radioChange}
                                    key={term.term_uid}
                                    checked={customField === term.term_uid}
                                />
                            )) : <div>No Taxonomy Terms Found</div>} */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CustomFieldExtension
